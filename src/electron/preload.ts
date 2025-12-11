import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  getServerUrl: () => ipcRenderer.invoke('get-server-url'),
});
