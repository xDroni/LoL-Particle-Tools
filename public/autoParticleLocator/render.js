const trackClones = [];
let context;

(async () => {
  const leagueGameClient = await window.electronAPI.getLeagueClient();

  if (leagueGameClient === undefined) {
    return;
  }

  const constraints = {
    audio: false,
    video: {
      mandatory: {
        chromeMediaSource: 'desktop',
        chromeMediaSourceId: leagueGameClient.id
      }
    }
  };
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  const track = stream.getVideoTracks()[0];
  trackClones.push(track.clone());
  const image = new ImageCapture(track);
  const bitmap = await image.grabFrame();
  const canvas = document.getElementById('screenshot');
  canvas.width = screen.width;
  canvas.height = screen.height;
  context = canvas.getContext('2d');
  context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);
  drawRectangle(bitmap.width, bitmap.height);

  window.electronAPI.sendLeagueClientReady();
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
  const cropImage = await loadImage(fullScreenshotBlob);

  const cropCanvas = document.createElement('canvas');
  [cropCanvas.width, cropCanvas.height] = [screenshotAreaWidth, screenshotAreaHeight];
  const cropContext = cropCanvas.getContext('2d');
  cropContext.drawImage(
    cropImage,
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
  let lastMouseXOnDown = 0;
  let lastMouseYOnDown = 0;
  let lastMouseXOnUp = 0;
  let lastMouseYOnUp = 0;
  let mouseX = 0;
  let mouseY = 0;
  let mouseDown = false;

  async function sendImageSrc() {
    await new Promise((resolve) => setTimeout(resolve, 75));
    const cropImageSrc = await refreshScreen();
    await window.electronAPI.sendImageSrcResponse(cropImageSrc);
  }
  function mouseDownListener(e) {
    lastMouseXOnDown = e.clientX - canvasX;
    lastMouseYOnDown = e.clientY - canvasY;
    mouseDown = true;
  }

  async function mouseUpListener(e) {
    lastMouseXOnUp = e.clientX - canvasX;
    lastMouseYOnUp = e.clientY - canvasY;

    // register the listener for the future image source requests
    window.electronAPI.waitForImageSrcRequest(sendImageSrc);

    screenshotAreaX = lastMouseXOnDown > lastMouseXOnUp ? lastMouseXOnUp : lastMouseXOnDown;
    screenshotAreaY = lastMouseYOnDown > lastMouseYOnUp ? lastMouseYOnUp : lastMouseYOnDown;

    screenshotAreaWidth = Math.abs(lastMouseXOnUp - lastMouseXOnDown);
    screenshotAreaHeight = Math.abs(lastMouseYOnUp - lastMouseYOnDown);
    mouseDown = false;
    rectangleCanvas.removeEventListener('mouseup', mouseUpListener);
    rectangleCanvas.removeEventListener('mousedown', mouseDownListener);
    rectangleCanvas.removeEventListener('mousemove', mouseMoveListener);

    // send the first image source without requesting
    await sendImageSrc();
  }

  function mouseMoveListener(e) {
    {
      mouseX = e.clientX - canvasX;
      mouseY = e.clientY - canvasY;
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
