import * as React from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface NumberInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>, 
    "onChange" | "value" | "type" | "pattern" | "inputMode" | "onWheel"
  > {
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
      // Prevent the default browser behavior
      e.preventDefault();
      e.stopPropagation();
      
      // Remove focus to ensure the browser doesn't apply any scroll behavior
      if (document.activeElement === e.currentTarget) {
        e.currentTarget.blur();
      }
    }
    
    // Stop propagation for mousedown events that happen with the scroll wheel (middle button)
    const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
      if (e.button === 1) { // Middle mouse button (scroll wheel)
        e.preventDefault();
      }
      props.onMouseDown?.(e);
    };

    return (
      <Input
        {...props}
        type="text"
        pattern={allowDecimals ? "[0-9]*\\.?[0-9]*" : "[0-9]*"}
        inputMode={allowDecimals ? "decimal" : "numeric"}
        value={inputValue}
        onChange={handleChange}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        className={cn("text-right", className)}
        placeholder={placeholder}
        ref={ref}
        min={undefined}
        max={undefined}
        step={undefined}
      />
    )
  }
)

NumberInput.displayName = "NumberInput"

export { NumberInput }