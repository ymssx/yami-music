import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';
import axios from 'axios';

const STEAM_API_KEY = 'CABC740336A32B57CD24273BEC145E9A';

// 获取当前模块的路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,  // 禁用 Node.js 的集成（安全性考虑）
      contextIsolation: true,  // 开启上下文隔离（防止潜在的攻击）
      preload: path.join(__dirname, './preload.js'),  // 指定 preload.js 文件
    },
  });

  mainWindow.loadURL('http://127.0.0.1:5173/#steam/home');  // 指向 Vite 开发服务器
}

app.whenReady().then(() => {
  createWindow();

  // API 请求接口
  ipcMain.handle('get-steam-data', async (event, steamId) => {
    try {
      const response = await axios.get(`https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/`, {
        params: {
          key: STEAM_API_KEY,
          steamid: steamId,
          include_appinfo: true,
          include_played_free_games: true,
        }
      });
      return response.data;  // 将数据返回给渲染进程
    } catch (error) {
      console.error(error);
      return { error: 'Failed to fetch data' };
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});