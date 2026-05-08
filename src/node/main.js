'use strict';
const path = require('path');
const { app, BrowserWindow, Menu, Tray } = require('electron');

const mainService = require('./main_service');
const checkUpdate = require('./check_update');
const sendStat = require('./send_stat');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win = null;
let willQuitApp = false;

const isDev = process.env.NODE_ENV === 'development';
const isWin = process.platform === 'win32';

const DEV_SERVER_URL = 'http://localhost:6076/';

function getBundledIndexUrl() {
  // Prefer the build output under app/, then fallback to src-level index.
  const bundledIndexPath = path.join(app.getAppPath(), 'app/index.html');
  return `file://${bundledIndexPath}`;
}

function loadRendererUrl(winRef) {
  if (isDev) {
    winRef.loadURL(DEV_SERVER_URL);
    return;
  }
  winRef.loadURL(`file://${path.join(__dirname, '../index.html')}`);
}

function createWindow() {
  // Create the browser window.
  if (isDev) {
    win = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: true,
        nodeIntegration: true,
      },
    });
  } else {
    win = new BrowserWindow({
      width: 900,
      height: 600,
      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: true,
        nodeIntegration: true,
      },
    });
  }

  global.CP_WIN = win;

  // and load the index.html of the app.
  loadRendererUrl(win);

  // In dev mode, fallback to built index if webpack dev server is not running.
  if (isDev) {
    win.webContents.on('did-fail-load', (_event, code, _desc, validatedURL) => {
      if (validatedURL !== DEV_SERVER_URL) return;
      // -3 is aborted navigation and can happen during redirects/reloads.
      if (code === -3) return;
      const fallbackUrl = getBundledIndexUrl();
      console.log(`Dev server unavailable, falling back to ${fallbackUrl}`);
      win.loadURL(fallbackUrl);
    });
  }

  // Open the DevTools.
  if (isDev) win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.on('close', e => {
    if (willQuitApp || isWin) {
      /* the user tried to quit the app */
      win = null;
    } else {
      /* the user only tried to close the window */
      e.preventDefault();
      win.hide();
    }
  });
  if (!isWin) {
    const tray = new Tray(path.join(__dirname, '../images/iconTemplate.png'));
    tray.on('click', () => {
      win.show();
    });
    // tray.setToolTip('Command Pad')
  }
  // appIcon.setPressedImage(`${__dirname}/../../build/trayicon-highlight.png`);

  if (!isDev && !isWin) {
    var template = [
      {
        label: 'Command Pad',
        submenu: [
          { label: 'About Command Pad', selector: 'orderFrontStandardAboutPanel:' },
          { type: 'separator' },
          {
            label: 'Quit',
            accelerator: 'Command+Q',
            click: function() {
              app.quit();
            },
          },
        ],
      },
      {
        label: 'Edit',
        submenu: [
          { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
          { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
          { type: 'separator' },
          { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
          { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
          { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
          { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
        ],
      },
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  }

  checkUpdate();
  sendStat({
    type: 'start',
  });
}

app.on('before-quit', () => {
  if (!isWin) willQuitApp = true;
});
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    console.log('all closed.');
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (!win) {
    createWindow();
  } else {
    win.show();
  }
});

app.on('will-quit', () => {
  mainService.appWillQuit();
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
