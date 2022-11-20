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

  const image = new ImageCapture(track);

  const bitmap = await image.grabFrame();

  // track.stop();

  const canvas = document.getElementById('screenshot');

  canvas.width = screen.width;
  canvas.height = screen.height;

  const context = canvas.getContext('2d');

  context.drawImage(bitmap, 0, 0, bitmap.width, bitmap.height);

  drawRectangle(bitmap.width, bitmap.height);

  // const img = canvas.toDataURL();
  //
  // const res = await fetch(img);
  // const buff = await res.arrayBuffer();
  //
  // return [
  //   new File([buff], `photo_${new Date()}.jpg`, { type: 'image/jpeg' })
  // ];
})();

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

  // context.fillStyle = '#F9DC5C';
  // context.fillRect(0,0,200,200);

  //mousedown
  rectangleCanvas.onmousedown = (e) => {
    lastMouseX = e.clientX - canvasX;
    lastMouseY = e.clientY - canvasY;
    mouseDown = true;
  };

  //mouseup
  rectangleCanvas.onmouseup = () => {
    // const imageData = rectangleContext.getImageData(lastMouseX, lastMouseY, mouseX - lastMouseX, mouseY - lastMouseY);
    const fullScreenshotBlob = document.getElementById('screenshot').toDataURL('image/png', 1);
    const cropImg = new Image();
    const x = lastMouseX;
    const y = lastMouseY;
    const width = mouseX - lastMouseX;
    const height = mouseY - lastMouseY;
    cropImg.src = fullScreenshotBlob;
    cropImg.dataset.cropOptions = JSON.stringify({ x, y, width, height });
    cropImg.onload = async () => {
      URL.revokeObjectURL(cropImg.src);
      if (cropImg.dataset.cropOptions === '') {
        return;
      }
      const cropCanvas = document.createElement('canvas');
      [cropCanvas.width, cropCanvas.height] = [width, height];
      const cropContext = cropCanvas.getContext('2d');
      cropContext.drawImage(cropImg, x, y, width, height, 0, 0, width, height);
      cropImg.src = cropCanvas.toDataURL('image/png', 1);
      cropImg.dataset.cropOptions = '';

      // var a = document.createElement('a');
      // a.href = cropImg.src;
      // a.download = 'asd';
      // document.body.appendChild(a);
      // a.click();

      const hash = await window.electronAPI.calculateHash(cropImg.src);
      console.log(hash);
    };

    mouseDown = false;
  };

  //mousemove
  rectangleCanvas.onmousemove = (e) => {
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
  };
}
