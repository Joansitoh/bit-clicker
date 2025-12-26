import { useState, useEffect } from 'react'
import { Mouse, KeyRound, Hand, Play, Square, Zap } from 'lucide-react'
import { Button, Slider, TextField } from '@mui/material'
import { EditableLabel } from './components/EditableLabel'

import logo from './assets/icon.png'

function App() {
  const [activeMode, setActiveMode] = useState('click') // 'click', 'hold', 'keypress'
  const [loaded, setLoaded] = useState(false)

  // Click mode settings
  const [clickSettings, setClickSettings] = useState({
    clickType: 0,
    delayMode: 0,
    fixedDelay: 100,
    randomDelayMin: 100,
    randomDelayMax: 200,
    hotkey: 'F6',
    isActive: false
  })

  // Hold mode settings
  const [holdSettings, setHoldSettings] = useState({
    clickType: 0,
    hotkey: 'F7',
    isActive: false
  })

  // Keypress mode settings
  const [keypressSettings, setKeypressSettings] = useState({
    keyPress: 'a',
    delayMode: 0,
    fixedDelay: 50,
    randomDelayMin: 50,
    randomDelayMax: 100,
    hotkey: 'F8',
    isActive: false
  })

  useEffect(() => {
    setTimeout(() => setLoaded(true), 300)
  }, [])

  useEffect(() => {
    if (loaded) {
      window.api.saveSettings({
        click: clickSettings,
        hold: holdSettings,
        keypress: keypressSettings
      })
    }
  }, [clickSettings, holdSettings, keypressSettings, loaded])

  useEffect(() => {
    window.api.onStatusChanged(({ mode, isActive }) => {
      if (mode === 'click') setClickSettings((prev) => ({ ...prev, isActive }))
      if (mode === 'hold') setHoldSettings((prev) => ({ ...prev, isActive }))
      if (mode === 'keypress') setKeypressSettings((prev) => ({ ...prev, isActive }))
    })
  }, [])

  const toggleActive = () => {
    const mode = activeMode
    const settings = getCurrentSettings()
    const newState = !settings.isActive

    window.api.toggleMode(mode, settings, newState)
    updateCurrentSettings({ isActive: newState })
  }

  const getCurrentSettings = () => {
    switch (activeMode) {
      case 'click':
        return clickSettings
      case 'hold':
        return holdSettings
      case 'keypress':
        return keypressSettings
      default:
        return clickSettings
    }
  }

  const updateCurrentSettings = (updates) => {
    // if letter is "escape", clear the hotkey
    if (updates.hotkey === 'Escape') {
      updates.hotkey = ''
    }

    switch (activeMode) {
      case 'click':
        setClickSettings({ ...clickSettings, ...updates })
        break
      case 'hold':
        setHoldSettings({ ...holdSettings, ...updates })
        break
      case 'keypress':
        setKeypressSettings({ ...keypressSettings, ...updates })
        break
    }
  }

  const calculateCPS = () => {
    if (activeMode !== 'click') return null
    const { delayMode, fixedDelay, randomDelayMin, randomDelayMax } = clickSettings

    if (delayMode === 0) {
      return fixedDelay > 0 ? (1000 / fixedDelay).toFixed(1) : 0
    } else {
      const avgDelay = (randomDelayMin + randomDelayMax) / 2
      return avgDelay > 0 ? (1000 / avgDelay).toFixed(1) : 0
    }
  }

  const handleHotkeyInput = (e) => {
    e.preventDefault()
    updateCurrentSettings({ hotkey: e.key })
  }

  const modes = [
    { id: 'click', name: 'Click', icon: Mouse, color: 'blue' },
    { id: 'hold', name: 'Hold', icon: Hand, color: 'purple' },
    { id: 'keypress', name: 'Keys', icon: KeyRound, color: 'green' }
  ]

  const currentSettings = getCurrentSettings()
  const cps = calculateCPS()

  return (
    <div className="w-full h-screen bg-[#0f0f0f] text-white flex">
      {/* Sidebar */}
      <div className="w-20 bg-[#0a0a0a] border-r border-gray-800 flex flex-col items-center py-6 gap-4">
        <div className="mb-4">
          <img src={logo} alt="Bit Clicker" className="w-8 h-8" />
        </div>

        <div className="flex-1 flex flex-col gap-3">
          {modes.map((mode) => {
            const Icon = mode.icon
            const isActive = activeMode === mode.id
            const isRunning = (() => {
              if (mode.id === 'click') return clickSettings.isActive
              if (mode.id === 'hold') return holdSettings.isActive
              if (mode.id === 'keypress') return keypressSettings.isActive
              return false
            })()

            return (
              <button
                key={mode.id}
                onClick={() => setActiveMode(mode.id)}
                className={`relative w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                  isActive
                    ? mode.color === 'blue'
                      ? 'bg-blue-600'
                      : mode.color === 'purple'
                        ? 'bg-purple-600'
                        : 'bg-green-600'
                    : 'bg-[#1a1a1a] hover:bg-[#242424]'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                <span className={`text-[10px] ${isActive ? 'text-white' : 'text-gray-600'}`}>
                  {mode.name}
                </span>
                {isRunning && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                )}
              </button>
            )
          })}
        </div>

        <div className="text-center">
          <div
            className={`w-2 h-2 rounded-full mx-auto mb-1 ${
              currentSettings.isActive ? 'bg-green-500' : 'bg-gray-700'
            }`}
          />
          <span className="text-[9px] text-gray-600">
            {currentSettings.isActive ? 'ON' : 'OFF'}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                {modes.find((m) => m.id === activeMode)?.name} Mode
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Hotkey: <span className="text-blue-400 font-mono">{currentSettings.hotkey}</span>
              </p>
            </div>
            <Button
              onClick={toggleActive}
              variant="contained"
              color={currentSettings.isActive ? 'error' : 'primary'}
              className="flex items-center gap-2"
            >
              {currentSettings.isActive ? (
                <>
                  <Square className="w-4 h-4" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start
                </>
              )}
            </Button>
          </div>

          {/* CPS Display for Click Mode */}
          {cps && activeMode === 'click' && (
            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg px-2 py-1 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Click Rate</span>
              </div>
              <span className="text-lg font-bold text-blue-400">
                {cps} <span className="text-xs opacity-70">CPS</span>
              </span>
            </div>
          )}
        </div>

        {/* Settings Content */}
        {loaded ? (
          <div className="flex-1 overflow-auto p-4">
            {activeMode === 'click' && (
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Click Button
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Left', 'Right', 'Middle'].map((btn, idx) => (
                      <Button
                        variant={clickSettings.clickType === idx ? 'contained' : 'outlined'}
                        size="sm"
                        key={btn}
                        onClick={() => setClickSettings({ ...clickSettings, clickType: idx })}
                      >
                        {btn}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Delay Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => setClickSettings({ ...clickSettings, delayMode: 0 })}
                      variant={clickSettings.delayMode === 0 ? 'contained' : 'outlined'}
                    >
                      Fixed
                    </Button>
                    <Button
                      onClick={() => setClickSettings({ ...clickSettings, delayMode: 1 })}
                      variant={clickSettings.delayMode === 1 ? 'contained' : 'outlined'}
                    >
                      Random
                    </Button>
                  </div>
                </div>

                {clickSettings.delayMode === 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-400">Delay</label>
                      <EditableLabel
                        value={clickSettings.fixedDelay}
                        onChange={(value) => updateCurrentSettings({ fixedDelay: value })}
                      />
                    </div>
                    <Slider
                      aria-label="Small"
                      valueLabelDisplay="auto"
                      className="mb-4"
                      step={1}
                      min={5}
                      max={5000}
                      value={clickSettings.fixedDelay}
                      onChange={(e) =>
                        setClickSettings({ ...clickSettings, fixedDelay: parseInt(e.target.value) })
                      }
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">Min Delay</label>
                        <EditableLabel
                          value={clickSettings.randomDelayMin}
                          onChange={(value) =>
                            updateCurrentSettings({
                              randomDelayMin: Math.min(value, clickSettings.randomDelayMax - 1),
                              randomDelayMax: Math.max(clickSettings.randomDelayMax, value + 1)
                            })
                          }
                        />
                      </div>
                      <Slider
                        aria-label="Min Delay"
                        valueLabelDisplay="auto"
                        className="mb-4"
                        step={1}
                        min={5}
                        max={10000}
                        value={clickSettings.randomDelayMin}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setClickSettings({
                            ...clickSettings,
                            randomDelayMin: val,
                            randomDelayMax: Math.max(val, clickSettings.randomDelayMax)
                          })
                        }}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">Max Delay</label>
                        <EditableLabel
                          value={clickSettings.randomDelayMax}
                          onChange={(value) =>
                            updateCurrentSettings({
                              randomDelayMax: Math.max(value, clickSettings.randomDelayMin + 1),
                              randomDelayMin: Math.min(clickSettings.randomDelayMin, value - 1)
                            })
                          }
                        />
                      </div>
                      <Slider
                        aria-label="Max Delay"
                        valueLabelDisplay="auto"
                        className="mb-4"
                        step={1}
                        min={5}
                        max={10000}
                        value={clickSettings.randomDelayMax}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setClickSettings({
                            ...clickSettings,
                            randomDelayMax: val,
                            randomDelayMin: Math.min(val, clickSettings.randomDelayMin)
                          })
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Hotkey</label>
                  <TextField
                    fullWidth
                    size="small"
                    value={clickSettings.hotkey}
                    InputProps={{
                      readOnly: true,
                      style: { textAlign: 'center' }
                    }}
                    inputProps={{
                      onKeyDown: handleHotkeyInput,
                      placeholder: 'Press a key...',
                      style: { textAlign: 'center' }
                    }}
                    variant="outlined"
                  />
                </div>
              </div>
            )}

            {activeMode === 'hold' && (
              <div className="space-y-6 max-w-md">
                <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-2">
                  <p className="text-sm text-gray-300">
                    Hold mode keeps the mouse button pressed continuously while active. No delays.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Click Button
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Left', 'Right', 'Middle'].map((btn, idx) => (
                      <Button
                        variant={holdSettings.clickType === idx ? 'contained' : 'outlined'}
                        key={btn}
                        onClick={() => setHoldSettings({ ...holdSettings, clickType: idx })}
                      >
                        {btn}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Hotkey</label>
                  <TextField
                    fullWidth
                    size="small"
                    value={holdSettings.hotkey}
                    InputProps={{
                      readOnly: true,
                      style: { textAlign: 'center' }
                    }}
                    inputProps={{
                      onKeyDown: handleHotkeyInput,
                      placeholder: 'Press a key...',
                      style: { textAlign: 'center' }
                    }}
                    variant="outlined"
                  />
                </div>
              </div>
            )}

            {activeMode === 'keypress' && (
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    Key to Press
                  </label>

                  <TextField
                    fullWidth
                    size="small"
                    value={keypressSettings.keyPress}
                    InputProps={{
                      readOnly: true,
                      style: { textAlign: 'center' }
                    }}
                    inputProps={{
                      onKeyDown: (e) => {
                        e.preventDefault()
                        // Handle key press input here if needed
                        setKeypressSettings({ ...keypressSettings, keyPress: e.key })
                      },
                      placeholder: 'Press a key...',
                      style: { textAlign: 'center' }
                    }}
                    variant="outlined"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Delay Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={keypressSettings.delayMode === 0 ? 'contained' : 'outlined'}
                      onClick={() => setKeypressSettings({ ...keypressSettings, delayMode: 0 })}
                      className={`py-3 rounded-lg text-sm font-medium transition-all ${
                        keypressSettings.delayMode === 0
                          ? 'bg-green-600 text-white'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#242424]'
                      }`}
                    >
                      Fixed
                    </Button>
                    <Button
                      variant={keypressSettings.delayMode === 1 ? 'contained' : 'outlined'}
                      onClick={() => setKeypressSettings({ ...keypressSettings, delayMode: 1 })}
                      className={`py-3 rounded-lg text-sm font-medium transition-all ${
                        keypressSettings.delayMode === 1
                          ? 'bg-green-600 text-white'
                          : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#242424]'
                      }`}
                    >
                      Random
                    </Button>
                  </div>
                </div>

                {keypressSettings.delayMode === 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-400">Delay</label>
                      <EditableLabel
                        className="text-lg font-bold text-green-400"
                        value={keypressSettings.fixedDelay}
                        onChange={(value) =>
                          setKeypressSettings({ ...keypressSettings, fixedDelay: Number(value) })
                        }
                      />
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="5000"
                      step="5"
                      value={keypressSettings.fixedDelay}
                      onChange={(e) =>
                        setKeypressSettings({
                          ...keypressSettings,
                          fixedDelay: Number(e.target.value)
                        })
                      }
                      className="w-full"
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">Min Delay</label>
                        <EditableLabel
                          className="text-lg font-bold text-green-400"
                          value={keypressSettings.randomDelayMin}
                          onChange={(value) =>
                            setKeypressSettings({
                              ...keypressSettings,
                              randomDelayMin: Number(value)
                            })
                          }
                        />
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10000"
                        step="5"
                        value={keypressSettings.randomDelayMin}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setKeypressSettings({
                            ...keypressSettings,
                            randomDelayMin: val,
                            randomDelayMax: Math.max(val, keypressSettings.randomDelayMax)
                          })
                        }}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-400">Max Delay</label>
                        <EditableLabel
                          className="text-lg font-bold text-green-400"
                          value={keypressSettings.randomDelayMax}
                          onChange={(value) =>
                            setKeypressSettings({
                              ...keypressSettings,
                              randomDelayMax: Number(value)
                            })
                          }
                        />
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="10000"
                        step="5"
                        value={keypressSettings.randomDelayMax}
                        onChange={(e) => {
                          const val = Number(e.target.value)
                          setKeypressSettings({
                            ...keypressSettings,
                            randomDelayMax: val,
                            randomDelayMin: Math.min(val, keypressSettings.randomDelayMin)
                          })
                        }}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Hotkey</label>
                  <TextField
                    fullWidth
                    size="small"
                    value={keypressSettings.hotkey}
                    InputProps={{
                      readOnly: true,
                      style: { textAlign: 'center' }
                    }}
                    inputProps={{
                      onKeyDown: handleHotkeyInput,
                      placeholder: 'Press a key...',
                      style: { textAlign: 'center' }
                    }}
                    variant="outlined"
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-600">Loading...</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
