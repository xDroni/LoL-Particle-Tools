const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
let autoParticleLocatorHandleWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 770,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      spellcheck: false,
      nodeIntegration: true
    },
    title: 'LoL Particle Tools by dxdroni'
  });

  mainWindow.loadURL(
    isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`
  );

  mainWindow.webContents.setWindowOpenHandler(({ frameName }) => {
    if (frameName === 'ParticleLocatorWindow') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 330,
          height: 300,
          resizable: true,
          minimizable: false,
          maximizable: false,
          autoHideMenuBar: true,
          title: 'Particle Locator by dxdroni'
        }
      };
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('did-create-window', (newWindowComponent) => {
    mainWindow.minimize();
    newWindowComponent.setAlwaysOnTop(true, 'normal');
  });

  mainWindow.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });
  mainWindow.on('closed', () => (mainWindow = null));
}

function createAutoParticleLocatorHandleWindow() {
  autoParticleLocatorHandleWindow = new BrowserWindow({
    width: 1920, /// todo make it dynamic depending on resolution
    height: 1080,
    fullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true
    }
  });

  // autoParticleLocatorHandleWindow.setAlwaysOnTop(true, 'normal');
  autoParticleLocatorHandleWindow.loadFile(
    path.join(__dirname, './autoParticleLocator/index.html')
  );
  // autoParticleLocatorHandleWindow.webContents.openDevTools();
}

function closeAutoParticleLocatorWindow() {
  autoParticleLocatorHandleWindow.close();
}

app.commandLine.appendSwitch('ignore-certificate-errors');

app.on('ready', () => {
  ipcMain.on('start-auto-locating', () => {
    createAutoParticleLocatorHandleWindow();
  });

  ipcMain.on('stop-auto-locating', () => {
    closeAutoParticleLocatorWindow();
  });

  ipcMain.on('send-hash-request', () => {
    autoParticleLocatorHandleWindow.webContents.send('hash-requested');
  });

  ipcMain.handle('calculate-hash', (_, imageSrcArg) => {
    // const hashSum = crypto.createHash('sha1');
    // hashSum.update(imageSrcArg);

    // return hashSum.digest('base64');
    return imageSrcArg;
  });

  ipcMain.handle('get-sources', () => {
    return desktopCapturer.getSources({ types: ['window', 'screen'] }).then(async (sources) => {
      for (const source of sources) {
        if (source.name === 'League of Legends (TM) Client' && autoParticleLocatorHandleWindow) {
          return source;
        }
      }
    });
  });

  ipcMain.handle('send-hash-response', (_, hash) => {
    mainWindow.webContents.send('hash-message', hash);
  });

  createMainWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
});
