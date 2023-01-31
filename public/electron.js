const { app, BrowserWindow, ipcMain, desktopCapturer, screen } = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');
const { TOAST_NOTIFICATION_TYPES } = require('../src/common/types');

let mainWindow, autoParticleLocatorGameWindow, width, height;

app.commandLine.appendSwitch('ignore-certificate-errors');

app.whenReady().then(() => {
  ({ width, height } = screen.getPrimaryDisplay().size);
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }

  ipcMain.on('start-auto-locating', () => {
    createAutoParticleLocatorHandleWindow();
  });

  ipcMain.on('stop-auto-locating', () => {
    closeAutoParticleLocatorGameWindow();
  });

  ipcMain.on('league-client-ready', () => {
    autoParticleLocatorGameWindow.show();
  });

  ipcMain.on('send-imgsrc-request', () => {
    autoParticleLocatorGameWindow.webContents.send('imgsrc-requested');
  });

  ipcMain.handle('get-league-client', async () => {
    const sources = await desktopCapturer.getSources({ types: ['window', 'screen'] });

    if (autoParticleLocatorGameWindow === undefined) {
      sendClientNotFoundMessage();
      return sendToastNotification(
        TOAST_NOTIFICATION_TYPES.ERROR,
        'Some error occurred. Try again.'
      );
    }

    const leagueGameClient = sources.find(
      (source) => source.name === 'League of Legends (TM) Client'
    );
    if (leagueGameClient === undefined) {
      closeAutoParticleLocatorGameWindow();
      sendClientNotFoundMessage();
      return sendToastNotification(
        TOAST_NOTIFICATION_TYPES.ERROR,
        "Couldn't find the opened replay. Try to focus the window with game. Make sure window mode is set to Borderless or Windowed."
      );
    }
    return leagueGameClient;
  });

  ipcMain.handle('send-toast-notification', (_, type, message) => {
    return sendToastNotification(type, message);
  });

  ipcMain.handle('send-imgsrc-response', (_, imageSrc) => {
    return mainWindow.webContents.send('imgsrc-message', imageSrc);
  });

  createMainWindow();
});

function createMainWindow() {
  console.log(Math.floor(width * 0.78125), Math.floor(height * 0.712962962962963));
  mainWindow = new BrowserWindow({
    width: Math.floor(width * 0.78125),
    height: Math.floor(height * 0.712962962962963),
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webSecurity: false,
      spellcheck: false
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

  mainWindow.on('ready-to-show', () => mainWindow.show());

  mainWindow.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });
  mainWindow.on('closed', () => (mainWindow = null));
}

function createAutoParticleLocatorHandleWindow() {
  autoParticleLocatorGameWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  autoParticleLocatorGameWindow.loadFile(path.join(__dirname, './autoParticleLocator/index.html'));

  autoParticleLocatorGameWindow.on('closed', () => (autoParticleLocatorGameWindow = null));
}

function closeAutoParticleLocatorGameWindow() {
  if (autoParticleLocatorGameWindow !== null) {
    autoParticleLocatorGameWindow.close();
  }
}

function sendToastNotification(type, message) {
  restoreAndFocusMainWindow();
  return mainWindow.webContents.send('toast-notification', type, message);
}

function sendClientNotFoundMessage() {
  return mainWindow.webContents.send('client-not-found');
}

function restoreAndFocusMainWindow() {
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  if (!mainWindow.isFocused()) {
    return mainWindow.focus();
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
