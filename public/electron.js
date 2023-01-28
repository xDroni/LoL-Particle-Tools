const { app, BrowserWindow, ipcMain, desktopCapturer } = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');
const { TOAST_NOTIFICATION_TYPES } = require('../src/common/types');

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
          width: 346, //  -16
          height: 339, // -39
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

  autoParticleLocatorHandleWindow.on('closed', () => (autoParticleLocatorHandleWindow = null));
}

function closeAutoParticleLocatorWindow() {
  autoParticleLocatorHandleWindow.close();
}

function sendToastNotification(type, message) {
  return mainWindow.webContents.send('toast-notification', type, message);
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

  ipcMain.handle('get-league-client', async () => {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });

    if (autoParticleLocatorHandleWindow === undefined) {
      return sendToastNotification(
        TOAST_NOTIFICATION_TYPES.ERROR,
        `Some error occurred. Try again.`
      );
    }

    const leagueGameClient = sources.find(
      (source) => source.name === 'League of Legends (TM) Client'
    );
    if (leagueGameClient === undefined) {
      closeAutoParticleLocatorWindow();
      return sendToastNotification(
        TOAST_NOTIFICATION_TYPES.ERROR,
        `Couldn't find the opened replay. Try to focus the window with game. Make sure window mode is set to Borderless or Windowed.`
      );
    }
    return leagueGameClient;
  });

  ipcMain.handle('send-toast-notification', (_, type, message) => {
    return sendToastNotification(type, message);
  });

  ipcMain.handle('send-hash-response', (_, hash) => {
    return mainWindow.webContents.send('hash-message', hash);
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
