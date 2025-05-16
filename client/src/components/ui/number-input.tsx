import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  onChange?: (value: number | null) => void
  min?: number
  max?: number
  step?: number
  allowNegative?: boolean
  allowDecimals?: boolean
  value?: number | null
  placeholder?: string
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      onChange,
      min,
      max,
      step = 1,
      allowNegative = false,
      allowDecimals = false,
      value,
      placeholder,
      ...props
    },
    ref
  ) => {
    // Internal state to manage the input value as a string
    const [inputValue, setInputValue] = React.useState<string>(
      value !== null && value !== undefined ? value.toString() : ""
    )

    // Update the internal state when the value prop changes
    React.useEffect(() => {
      if (value !== null && value !== undefined) {
        setInputValue(value.toString())
      } else {
        setInputValue("")
      }
    }, [value])

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value

      // Allow empty input (will be treated as null)
      if (newValue === "") {
        setInputValue("")
        onChange?.(null)
        return
      }

      // Validate the input is a valid number format
      const regex = allowDecimals
        ? allowNegative
          ? /^-?\d*\.?\d*$/
          : /^\d*\.?\d*$/
        : allowNegative
        ? /^-?\d*$/
        : /^\d*$/

      if (regex.test(newValue)) {
        setInputValue(newValue)

        const numberValue = parseFloat(newValue)
        
        // If it's a valid number, apply min/max constraints and notify parent
        if (!isNaN(numberValue)) {
          let constrainedValue = numberValue
          
          if (min !== undefined && numberValue < min) {
            constrainedValue = min
          } else if (max !== undefined && numberValue > max) {
            constrainedValue = max
          }
          
          if (constrainedValue !== numberValue) {
            setInputValue(constrainedValue.toString())
          }
          
          onChange?.(constrainedValue)
        } else {
          onChange?.(null)
        }
      }
    }

    // Prevent the scroll wheel from changing the value
    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      e.currentTarget.blur() // Remove focus to prevent browser's default scroll behavior
      e.stopPropagation()
    }

    return (
      <Input
        type="text"
        pattern={allowDecimals ? "[0-9]*\\.?[0-9]*" : "[0-9]*"}
        inputMode={allowDecimals ? "decimal" : "numeric"}
        value={inputValue}
        onChange={handleChange}
        onWheel={handleWheel}
        className={cn("text-right", className)}
        placeholder={placeholder}
        ref={ref}
        {...props}
      />
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }