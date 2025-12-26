import { ipcMain, globalShortcut } from 'electron'
import { mouse, keyboard, Button } from '@nut-tree-fork/nut-js'
import storage from 'electron-json-storage'

const activeProcesses = {
  click: { isRunning: false, intervalId: null, isHolding: false },
  hold: { isRunning: false, intervalId: null, isHolding: false },
  keypress: { isRunning: false, intervalId: null, isHolding: false }
}

const getButton = (type) => {
  if (type === 1) return Button.RIGHT
  if (type === 2) return Button.MIDDLE
  return Button.LEFT
}

const getIntervalTime = (settings) => {
  if (settings.delayMode === 0) return Math.max(5, settings.fixedDelay)
  let min = settings.randomDelayMin
  let max = settings.randomDelayMax
  if (min > max) [min, max] = [max, min]
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const runExecution = async (mode, settings) => {
  try {
    if (mode === 'click') {
      if (settings.clickType === 0) await mouse.leftClick()
      else if (settings.clickType === 1) await mouse.rightClick()
      else await mouse.middleClick()
    } else if (mode === 'keypress') {
      if (settings.keyPress) await keyboard.type(settings.keyPress)
    }
  } catch (err) {
    console.error(`Error in mode ${mode}:`, err)
  }
}

const startMode = async (mainWindow, mode, settings) => {
  const process = activeProcesses[mode]
  if (process.isRunning) return
  process.isRunning = true

  if (mode === 'hold') {
    process.isHolding = true
    await mouse.pressButton(getButton(settings.clickType))
  } else {
    const schedule = async () => {
      if (!process.isRunning) return
      await runExecution(mode, settings)
      process.intervalId = setTimeout(schedule, getIntervalTime(settings))
    }
    schedule()
  }
  mainWindow.webContents.send('status-changed', { mode, isActive: true })
}

const stopMode = async (mainWindow, mode) => {
  const process = activeProcesses[mode]
  process.isRunning = false

  if (process.intervalId) {
    clearTimeout(process.intervalId)
    process.intervalId = null
  }

  if (mode === 'hold' || process.isHolding) {
    await mouse.releaseButton(Button.LEFT)
    await mouse.releaseButton(Button.RIGHT)
    await mouse.releaseButton(Button.MIDDLE)
    process.isHolding = false
  }
  mainWindow.webContents.send('status-changed', { mode, isActive: false })
}

export const registerIpcHandlers = (mainWindow) => {
  // Load initial settings
  ipcMain.handle('load-settings', () => {
    return new Promise((resolve) => {
      storage.get('clicker-settings-v2', (err, data) => {
        resolve(Object.keys(data).length > 0 ? data : null)
      })
    })
  })

  // Save and re-register hotkeys
  ipcMain.on('save-settings', (event, allSettings) => {
    storage.set('clicker-settings-v2', allSettings)

    globalShortcut.unregisterAll()

    Object.entries(allSettings).forEach(([mode, settings]) => {
      if (settings.hotkey && settings.hotkey !== 'None') {
        globalShortcut.register(settings.hotkey, () => {
          if (activeProcesses[mode].isRunning) stopMode(mainWindow, mode)
          else startMode(mainWindow, mode, settings)
        })
      }
    })
  })

  // Manual control from UI
  ipcMain.on('toggle-mode', (event, { mode, settings, active }) => {
    if (active) startMode(mainWindow, mode, settings)
    else stopMode(mainWindow, mode)
  })
}
