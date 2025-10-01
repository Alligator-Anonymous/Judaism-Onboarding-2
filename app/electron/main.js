// Codex change: Guarded DevTools opening behind an environment flag.
import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !!process.env.VITE_DEV_SERVER_URL;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL ?? 'http://localhost:5173';

  if (isDev) {
    win.loadURL(devUrl);
  } else {
    const indexPath = path.join(__dirname, '../renderer/dist/index.html');
    win.loadFile(indexPath);
  }

  if (process.env.ELECTRON_OPEN_DEVTOOLS === '1') {
    win.webContents.openDevTools({ mode: 'detach' });
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
