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
  console.log('fullScreenshotBlob');
  console.log(fullScreenshotBlob);
  const cropImg = await loadImage(fullScreenshotBlob);
  console.log('cropImg');
  console.log(cropImg);

  const cropCanvas = document.createElement('canvas');
  console.log('screenshotAreaWidth', 'screenshotAreaHeight');
  console.log(screenshotAreaWidth, screenshotAreaHeight);
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

  // console.log(cropCanvas.toDataURL('image/png', 1));

  return Promise.resolve(cropCanvas.toDataURL('image/bmp', 1));
}

function drawRectangle() {
  const rectangleCanvas = document.getElementById('rectangle');
  rectangleCanvas.width = screen.width;
  rectangleCanvas.height = screen.height;
  const rectangleContext = rectangleCanvas.getContext('2d');
  const canvasX = rectangleCanvas.offsetLeft;
  const canvasY = rectangleCanvas.offsetTop;
  let lastMouseXOnDown = 0;
  let lastMouseYOnDown = 0;
  let lastMouseXOnUp = 0;
  let lastMouseYOnUp = 0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseDown = false;

  async function sendHash() {
    await new Promise((resolve) => setTimeout(resolve, 64));
    const cropImgSrc = await refreshScreen();
    console.log('cropImgSrc');
    console.log(cropImgSrc);
    console.log('calculating hash...');
    const hash = await window.electronAPI.calculateHash(cropImgSrc);
    console.log(hash);
    await window.electronAPI.sendHashResponse(hash);
  }
  function mouseDownListener(e) {
    lastMouseXOnDown = e.clientX - canvasX;
    lastMouseYOnDown = e.clientY - canvasY;
    console.log('lastMouseXOnDown', 'lastMouseYOnDown');
    console.log(lastMouseXOnDown, lastMouseYOnDown);
    mouseDown = true;
  }

  async function mouseUpListener(e) {
    lastMouseXOnUp = e.clientX - canvasX;
    lastMouseYOnUp = e.clientY - canvasY;
    console.log(lastMouseXOnUp, lastMouseYOnUp);
    console.log('lastMouseXOnUp', 'lastMouseYOnUp');

    // register the listener for the future hash requests
    window.electronAPI.waitForHashRequest(sendHash);

    screenshotAreaX = lastMouseXOnDown > lastMouseXOnUp ? lastMouseXOnUp : lastMouseXOnDown;
    screenshotAreaY = lastMouseYOnDown > lastMouseYOnUp ? lastMouseYOnUp : lastMouseYOnDown;

    screenshotAreaWidth = Math.abs(lastMouseXOnUp - lastMouseXOnDown);
    screenshotAreaHeight = Math.abs(lastMouseYOnUp - lastMouseYOnDown);
    console.log('screenshotAreaX', 'screenshotAreaY');
    console.log(screenshotAreaX, screenshotAreaY);
    console.log('screenshotAreaWidth', 'screenshotAreaHeight');
    console.log(screenshotAreaWidth, screenshotAreaHeight);
    mouseDown = false;
    console.log('###removing listeners');
    rectangleCanvas.removeEventListener('mouseup', mouseUpListener);
    rectangleCanvas.removeEventListener('mousedown', mouseDownListener);
    rectangleCanvas.removeEventListener('mousemove', mouseMoveListener);

    // send the first hash without requesting
    await sendHash();
  }

  function mouseMoveListener(e) {
    {
      mouseX = e.clientX - canvasX;
      mouseY = e.clientY - canvasY;
      console.log(mouseX, mouseY);
      if (mouseDown) {
        rectangleContext.clearRect(0, 0, rectangleCanvas.width, rectangleCanvas.height);
        rectangleContext.beginPath();
        let width = mouseX - lastMouseXOnDown;
        let height = mouseY - lastMouseYOnDown;
        rectangleContext.fillStyle = 'rgba(255, 255, 255, 0.5)';
        rectangleContext.fillRect(lastMouseXOnDown, lastMouseYOnDown, width, height);
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
