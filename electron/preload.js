const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSteamData: (steamId) => ipcRenderer.invoke('get-steam-data', steamId),  // 将调用传递给主进程
});
