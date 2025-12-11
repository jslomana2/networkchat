import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../../build/icon.png'),
    backgroundColor: '#f3f4f6',
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../frontend/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startBackend() {
  const backendPath = isDev
    ? path.join(__dirname, '../../src/backend/server.ts')
    : path.join(process.resourcesPath, 'backend/server.js');

  const args = isDev ? ['-r', 'ts-node/register', backendPath] : [backendPath];
  const execPath = isDev ? 'node' : process.execPath;

  backendProcess = fork(backendPath, [], {
    execPath: execPath,
    execArgv: isDev ? ['-r', 'ts-node/register'] : [],
    stdio: 'inherit',
  });

  backendProcess.on('error', (err) => {
    console.error('Error al iniciar el backend:', err);
  });

  backendProcess.on('exit', (code) => {
    console.log(`Proceso backend finalizado con código ${code}`);
  });
}

function stopBackend() {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, 2000); // Esperar a que el backend se inicie

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  stopBackend();
});

// IPC handlers
ipcMain.handle('get-server-url', () => {
  return 'http://localhost:3001';
});
