import { useState, useRef, useEffect } from 'react'
import { TextField, InputAdornment } from '@mui/material'

export const EditableLabel = ({ value, onChange, unit = 'ms', className = '' }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef(null)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleClick = () => {
    setIsEditing(true)
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
        inputRef.current.select()
      }
    }, 0)
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    if (!isNaN(newValue) && newValue !== '') {
      setInputValue(parseInt(newValue, 10))
    } else if (newValue === '') {
      setInputValue('')
    }
  }

  const handleBlur = () => {
    if (inputValue !== '' && !isNaN(inputValue) && inputValue > 0) {
      onChange(inputValue)
    } else {
      setInputValue(value)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleBlur()
    } else if (e.key === 'Escape') {
      setInputValue(value)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <TextField
        inputRef={inputRef}
        type="number"
        value={inputValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        variant="outlined"
        size="small"
        inputProps={{
          min: 1,
          className: 'text-right',
          style: { textAlign: 'right' }
        }}
        InputProps={{
          endAdornment: <InputAdornment position="end">{unit}</InputAdornment>,
          disableUnderline: true
        }}
        autoFocus
      />
    )
  }

  return (
    <span
      className={`text-lg font-bold text-blue-400 cursor-pointer hover:bg-gray-700 px-2 py-1 rounded ${className}`}
      onClick={handleClick}
    >
      {value}
      {unit}
    </span>
  )
}
