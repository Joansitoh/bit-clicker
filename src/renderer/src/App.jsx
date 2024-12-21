import { useState, useEffect } from 'react'
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Skeleton,
  Slider,
  Switch,
  TextField,
  Typography
} from '@mui/material'
import { AdsClickRounded } from '@mui/icons-material'

function App() {
  const [delayMode, setDelayMode] = useState(0) // 0 = fixed, 1 = random
  const [clickMode, setClickMode] = useState(0) // 0 = click, 1 = keypress

  const [clickType, setClickType] = useState(0)
  const [keyPress, setKeyPress] = useState('')

  const [fixedDelay, setFixedDelay] = useState(1000)
  const [randomDelayMin, setRandomDelayMin] = useState(1000)
  const [randomDelayMax, setRandomDelayMax] = useState(2000)
  const [hotkey, setHotkey] = useState('F6')

  const [clickerStarted, setClickerStarted] = useState(false)
  const [loaded, setLoaded] = useState(false)

  // Load storage values
  useEffect(async () => {
    const settings = await window.api.loadSettings()
    setDelayMode(settings.interval.type)
    setRandomDelayMin(settings.interval.randomDelayMin || 1000)
    setRandomDelayMax(settings.interval.randomDelayMax || 2000)
    setFixedDelay(settings.interval.fixedDelay)

    setHotkey(settings.hotkey)
    setClickMode(settings.clickMode)
    setClickType(settings.clickType)
    setKeyPress(settings.keyPress)

    console.log(
      'Loaded settings:',
      settings.interval.type,
      settings.interval.value,
      settings.hotkey,
      settings.clickMode,
      settings.clickType,
      settings.keyPress
    )

    setLoaded(true)
  }, [])

  useEffect(() => {
    window.api.onAutoclickerStarted((status) => {
      setClickerStarted(status)
    })

    // Cleanup
    return () => {
      window.api.onAutoclickerStarted(() => {}) // Unsubscribe
    }
  }, [])

  const updateSettings = () => {
    const settings = {
      interval: {
        type: delayMode,
        fixedDelay: fixedDelay,
        randomDelayMin: randomDelayMin,
        randomDelayMax: randomDelayMax
      },
      hotkey: hotkey,
      clickMode: clickMode,
      clickType: clickType,
      keyPress: keyPress
    }
    window.api.saveSettings(settings)
  }

  const handleKeyDown = (e) => {
    e.preventDefault()
    setHotkey(e.key)
  }

  useEffect(() => {
    if (loaded) updateSettings()
  }, [
    hotkey,
    delayMode,
    fixedDelay,
    randomDelayMin,
    randomDelayMax,
    clickMode,
    clickType,
    keyPress
  ])

  const handleSetSetting = (key, value) => {
    switch (key) {
      case 'interval.type':
        setDelayMode(value)
        break
      case 'interval.value':
        setFixedDelay(value)
        break
      case 'interval.value.min':
        // Check if min is less than max
        if (value > randomDelayMax) setRandomDelayMax(randomDelayMax)
        else setRandomDelayMin(value)
        break
      case 'interval.value.max':
        // Check if max is greater than min
        if (value < randomDelayMin) setRandomDelayMin(randomDelayMin)
        else setRandomDelayMax(value)
        break
      case 'type':
        setClickMode(value)
        break
      case 'keypress':
        setKeyPress(value)
        break
      case 'clicktype':
        setClickType(value)
        break
    }
  }

  return (
    <div className="w-full h-screen flex flex-col p-4 gap-2">
      <div className="flex flex-col mb-4">
        <div className="flex gap-2 items-center">
          <AdsClickRounded className="text-3xl font-bold" />
          <h1 className="text-2xl font-bold">BitClicker</h1>
        </div>
        <p className="text-sm text-gray-500">Modern and simple auto clicker</p>
      </div>
      <div className="flex justify-between items-center">
        <p>AutoClicker is OFF</p>
        <Button variant="contained" color={clickerStarted ? 'error' : 'primary'}>
          {clickerStarted ? 'OFF' : 'ON'}
        </Button>
      </div>
      <div className="h-full justify-between flex flex-col">
        {loaded ? (
          <>
            <div className="flex flex-col">
              {/* Action type section */}
              <section className="flex flex-col gap-2 mb-8">
                <FormControl component="fieldset" variant="standard">
                  <FormLabel component="legend">Action Type</FormLabel>
                  <FormControlLabel
                    control={
                      <Switch
                        onChange={() => {
                          handleSetSetting('type', clickMode == 0 ? 1 : 0)
                        }}
                        value={clickMode == 0}
                      />
                    }
                    label={clickMode == 0 ? 'Mouse Click' : 'Key Press'}
                  />
                </FormControl>
                <FormControl component="fieldset" variant="standard">
                  <div className="flex flex-col gap-2">
                    <FormLabel component="legend">
                      {clickMode == 0 ? 'Click Type' : 'Key to Press'}
                    </FormLabel>
                    {clickMode == 0 ? (
                      <Select
                        value={clickType}
                        onChange={(e) => handleSetSetting('clicktype', e.target.value)}
                        variant="outlined"
                        size="small"
                      >
                        <MenuItem value={0}>Left Click</MenuItem>
                        <MenuItem value={1}>Right Click</MenuItem>
                        <MenuItem value={2}>Middle Click</MenuItem>
                      </Select>
                    ) : (
                      <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={keyPress}
                        placeholder="Enter a key (e.g., a, b, Enter)"
                        onChange={(e) => handleSetSetting('keypress', e.target.value)}
                      />
                    )}
                  </div>
                </FormControl>
              </section>
              {/* Delay type section */}
              <section className="flex flex-col gap-2 mb-8">
                <FormControl component="fieldset" variant="standard">
                  <FormLabel component="legend">Delay Mode</FormLabel>
                  <FormControlLabel
                    control={
                      <Switch
                        onChange={() => {
                          handleSetSetting('interval.type', delayMode == 0 ? 1 : 0)
                        }}
                        value={delayMode == 0}
                      />
                    }
                    label={delayMode == 0 ? 'Fixed' : 'Random'}
                  />
                </FormControl>
                {delayMode == 0 ? (
                  <div className="flex flex-col gap-2">
                    <FormLabel component="legend">Fixed Delay (ms)</FormLabel>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      type="number"
                      value={fixedDelay}
                      onChange={(e) => handleSetSetting('interval.value', e.target.value)}
                    />
                  </div>
                ) : (
                  <div className="flex gap-2 flex-col">
                    <div className="flex flex-col">
                      <Typography>Min delay: {randomDelayMin} ms</Typography>
                      <Slider
                        valueLabelDisplay="auto"
                        value={randomDelayMin}
                        max={10000}
                        step={100}
                        onChange={(e) => handleSetSetting('interval.value.min', e.target.value)}
                      />
                    </div>
                    <div className="flex flex-col">
                      <Typography>Max delay: {randomDelayMax} ms</Typography>
                      <Slider
                        valueLabelDisplay="auto"
                        value={randomDelayMax}
                        max={10000}
                        step={100}
                        onChange={(e) => handleSetSetting('interval.value.max', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </section>
            </div>
            <div className="w-full flex flex-col gap-2">
              <FormLabel component="legend">Hotkey</FormLabel>
              <input
                type="text"
                value={hotkey}
                readOnly
                onKeyDown={handleKeyDown}
                className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:border-indigo-500 bg-transparent text-center"
              />
            </div>
          </>
        ) : (
          <Skeleton variant="rectangular" height={200} />
        )}
      </div>
    </div>
  )
}

export default App
