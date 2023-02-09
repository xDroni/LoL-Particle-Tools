const { app, BrowserWindow, ipcMain, desktopCapturer, screen, shell } = require('electron');

const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow, autoParticleLocatorGameWindow, width, height, TOAST_NOTIFICATION_TYPES;

app.commandLine.appendSwitch('ignore-certificate-errors');

app.whenReady().then(() => {
  ({ width, height } = screen.getPrimaryDisplay().size);
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }

  const getSharedTypesListener = (_, sharedTypes) => {
    ({ TOAST_NOTIFICATION_TYPES } = sharedTypes);
    ipcMain.removeListener('shared-types', getSharedTypesListener);
  };

  ipcMain.on('shared-types', getSharedTypesListener);

  ipcMain.on('start-auto-locating', createAutoParticleLocatorHandleWindow);

  ipcMain.on('stop-auto-locating', closeAutoParticleLocatorGameWindow);

  ipcMain.on('league-client-ready', async () => {
    await new Promise((resolve) => setTimeout(resolve, 50));
    return autoParticleLocatorGameWindow.show();
  });

  ipcMain.on('send-imgsrc-request', () =>
    autoParticleLocatorGameWindow.webContents.send('imgsrc-requested')
  );

  ipcMain.on('send-toast-notification', (_, type, message) => sendToastNotification(type, message));

  ipcMain.on('focus-main-window', restoreAndFocusMainWindow);

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
        'Replay not found. Try to focus the window with the game. Make sure the window mode is set to borderless or windowed.'
      );
    }
    return leagueGameClient;
  });

  ipcMain.handle('send-imgsrc-response', (_, imageSrc) => {
    return mainWindow.webContents.send('imgsrc-message', imageSrc);
  });

  createMainWindow();
});

function createMainWindow() {
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

  mainWindow.webContents.setWindowOpenHandler(({ frameName, url }) => {
    if (frameName === 'ParticleLocatorWindow') {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 346,
          height: 339,
          resizable: true,
          minimizable: false,
          maximizable: false,
          autoHideMenuBar: true,
          title: 'Particle Locator by dxdroni'
        }
      };
    }
    if (url.includes('http')) {
      void shell.openExternal(url);
      return { action: 'deny' };
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
    mainWindow.minimize();
    return mainWindow.restore();
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
