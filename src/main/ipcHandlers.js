import { ipcMain, globalShortcut } from 'electron'
import { mouse, keyboard } from '@nut-tree-fork/nut-js'

import storage from 'electron-json-storage'

let isClicking = false
let intervalId = null

const startAutoclicker = async (mainWindow) => {
  if (isClicking) return
  isClicking = true

  // Get settings
  let interval = { type: 0, fixedDelay: 1000, randomDelayMin: 1000, randomDelayMax: 2000 }
  let clickMode = 0
  let clickType = 0
  let keyPress = ''

  try {
    const data = await new Promise((resolve, reject) => {
      storage.get('clicker-settings', (error, data) => {
        if (error || Object.keys(data).length === 0) {
          resolve({})
        } else {
          resolve(data)
        }
      })
    })

    if (data.interval) {
      interval = data.interval
    }

    if (data.clickMode) {
      clickMode = data.clickMode
    }

    if (data.clickType) {
      clickType = data.clickType
    }

    if (data.keyPress) {
      keyPress = data.keyPress
    }
  } catch (err) {
    console.error('Error getting settings from storage:', err)
  }

  // Función para realizar un clic
  const clickMouse = async (clickType) => {
    switch (clickType) {
      case 0:
        await mouse.leftClick()
        break
      case 1:
        await mouse.rightClick()
        break
      case 2:
        await mouse.middleClick()
        break
    }
  }

  const click = async () => {
    if (!isClicking) return
    switch (clickMode) {
      case 0:
        await clickMouse(clickType)
        break
      case 1:
        if (keyPress) {
          try {
            await keyboard.type(keyPress)
          } catch (err) {
            console.error('Error pressing key:', err)
          }
        }
        break
    }
  }

  const type = interval?.type
  let intervalTime

  if (type == 0) {
    intervalTime = interval?.fixedDelay
  } else if (type == 1) {
    const min = interval?.randomDelayMin
    const max = interval?.randomDelayMax
    intervalTime = Math.floor(Math.random() * (max - min + 1)) + min
  }

  // Use setInterval to click
  intervalId = setInterval(click, intervalTime)

  // Notify renderer
  mainWindow.webContents.send('autoclicker-started', true)
}

const stopAutoclicker = (mainWindow) => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null // Cleanup
  }
  isClicking = false

  // Notify renderer
  mainWindow.webContents.send('autoclicker-started', false)
}

// Register IPC handlers
const registerIpcHandlers = (mainWindow) => {
  ipcMain.handle('load-settings', async () => {
    return new Promise((resolve, reject) => {
      storage.get('clicker-settings', (error, data) => {
        if (error || Object.keys(data).length === 0) {
          resolve({
            interval: {
              type: 0,
              fixedDelay: 1000,
              randomDelayMin: 1000,
              randomDelayMax: 2000
            },
            hotkey: 'F6',
            clickMode: 0,
            clickType: 0,
            keyPress: ''
          }) // Default settings
        } else {
          resolve(data)
        }
      })
    })
  })

  ipcMain.on('save-settings', (event, settings) => {
    storage.set('clicker-settings', settings, (error) => {
      if (error) console.error('Error saving settings:', error)
      else {
        const hotkey = settings.hotkey
        if (hotkey) {
          globalShortcut.unregisterAll()
          const registered = globalShortcut.register(hotkey, () => {
            if (isClicking) stopAutoclicker(mainWindow)
            else startAutoclicker(mainWindow)
          })

          if (!registered) {
            console.error(`Error registering hotkey: ${hotkey}`)
          }
        }
      }
    })
  })

  mainWindow.on('close', () => {
    globalShortcut.unregisterAll()
    stopAutoclicker(mainWindow) // Cleanup
  })
}

export { registerIpcHandlers }
