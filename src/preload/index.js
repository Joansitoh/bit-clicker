import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  // Listen for status changes (when activated by Hotkey)
  onStatusChanged: (callback) => ipcRenderer.on('status-changed', (_, data) => callback(data)),

  // Configuration
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  saveSettings: (settings) => ipcRenderer.send('save-settings', settings),

  // Manual control
  toggleMode: (mode, settings, active) =>
    ipcRenderer.send('toggle-mode', { mode, settings, active })
})
