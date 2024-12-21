import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Functions to interact with the autoclicker
  onAutoclickerStarted: (callback) =>
    ipcRenderer.on('autoclicker-started', (_, status) => callback(status)),

  // Configuration exposes
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings)
})
