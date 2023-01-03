const trackClones = [];
let context;

(async () => {
  const source = await window.electronAPI.getSources();

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: source.id
      }
    }
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const track = stream.getVideoTracks()[0];
  trackClones.push(track.clone());
  const image = new ImageCapture(track);
  const bitmap = await image.grabFrame();

  // track.stop();

  const canvas = document.getElementById('screenshot');
  canvas.width = screen.width;
  canvas.height = screen.height;
  context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
  drawRectangle(bitmap.width, bitmap.height);
})();

let screenshotAreaX, screenshotAreaY, screenshotAreaWidth, screenshotAreaHeight;

const loadImage = (src) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

async function refreshScreen() {
  trackClones.push(trackClones[0].clone());
  const track = trackClones.shift();
  const image = new ImageCapture(track);
  const bitmap = await image.grabFrame();
  context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

  const fullScreenshotBlob = document.getElementById('screenshot').toDataURL('image/png', 1);
  const cropImg = await loadImage(fullScreenshotBlob);

  const cropCanvas = document.createElement('canvas');
  [cropCanvas.width, cropCanvas.height] = [screenshotAreaWidth, screenshotAreaHeight];
  const cropContext = cropCanvas.getContext('2d');
  cropContext.drawImage(
    cropImg,
    screenshotAreaX,
    screenshotAreaY,
    screenshotAreaWidth,
    screenshotAreaHeight,
    0,
    0,
    screenshotAreaWidth,
    screenshotAreaHeight
  );

  return Promise.resolve(cropCanvas.toDataURL('image/png', 1));
}

function drawRectangle() {
  const rectangleCanvas = document.getElementById('rectangle');
  rectangleCanvas.width = screen.width;
  rectangleCanvas.height = screen.height;
  const rectangleContext = rectangleCanvas.getContext('2d');
  const canvasX = rectangleCanvas.offsetLeft;
  const canvasY = rectangleCanvas.offsetTop;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseDown = false;

  async function sendHash() {
    await new Promise((resolve) => setTimeout(resolve, 60));
    const cropImgSrc = await refreshScreen();
    const hash = await window.electronAPI.calculateHash(cropImgSrc);
    console.log(hash);
    await window.electronAPI.sendHashResponse(hash);
  }

  function mouseDownListener(e) {
    lastMouseX = e.clientX - canvasX;
    lastMouseY = e.clientY - canvasY;
    mouseDown = true;
  }

  function mouseUpListener() {
    window.electronAPI.waitForHashRequest(async () => {
      await sendHash();
    });

    screenshotAreaX = lastMouseX;
    screenshotAreaY = lastMouseY;
    screenshotAreaWidth = mouseX - lastMouseX;
    screenshotAreaHeight = mouseY - lastMouseY;
    mouseDown = false;
    rectangleCanvas.removeEventListener('mouseup', mouseUpListener);
    rectangleCanvas.removeEventListener('mousedown', mouseDownListener);
    rectangleCanvas.removeEventListener('mousemove', mouseMoveListener);
  }

  function mouseMoveListener(e) {
    {
      mouseX = e.clientX - canvasX;
      mouseY = e.clientY - canvasY;
      if (mouseDown) {
        rectangleContext.clearRect(0, 0, rectangleCanvas.width, rectangleCanvas.height);
        rectangleContext.beginPath();
        let width = mouseX - lastMouseX;
        let height = mouseY - lastMouseY;
        rectangleContext.fillStyle = 'rgba(255, 255, 255, 0.5)';
        rectangleContext.fillRect(lastMouseX, lastMouseY, width, height);
        rectangleContext.strokeStyle = 'white';
        rectangleContext.lineWidth = 2;
        rectangleContext.stroke();
      }
    }
  }

  //mousedown
  rectangleCanvas.addEventListener('mousedown', mouseDownListener);

  //mouseup
  rectangleCanvas.addEventListener('mouseup', mouseUpListener);

  //mousemove
  rectangleCanvas.addEventListener('mousemove', mouseMoveListener);
}
