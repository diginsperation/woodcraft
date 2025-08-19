import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HelpCircle, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  type ColorFormat,
  parseColorToHsl,
  formatHsl,
  formatHslCss,
  hslToHex,
  hexToHslString,
  validateColor,
  colorToHex,
} from "@/lib/colorUtils";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  description?: string;
}

export function ColorField({ label, value, onChange, description }: ColorFieldProps) {
  const [format, setFormat] = useState<ColorFormat>('HSL');
  const [textValue, setTextValue] = useState(value || '');
  const [hexValue, setHexValue] = useState('#000000');
  const [validation, setValidation] = useState({ isValid: true, error: '' });

  // Update hex value when text value changes
  useEffect(() => {
    const hsl = parseColorToHsl(textValue);
    if (hsl) {
      setHexValue(hslToHex(hsl[0], hsl[1], hsl[2]));
    } else if (textValue.startsWith('#')) {
      setHexValue(textValue);
    }
  }, [textValue]);

  // Initialize text value from prop
  useEffect(() => {
    if (value && value !== textValue) {
      setTextValue(value);
    }
  }, [value]);

  // Debounced validation and change handler
  const debouncedChange = useCallback(
    debounce((newValue: string) => {
      const validationResult = validateColor(newValue);
      setValidation({ 
        isValid: validationResult.isValid, 
        error: validationResult.error || '' 
      });
      
      if (validationResult.isValid) {
        // Normalize to HSL format for storage
        const hsl = parseColorToHsl(newValue);
        if (hsl) {
          const normalized = formatHsl(hsl[0], hsl[1], hsl[2]);
          onChange(normalized);
        }
      }
    }, 200),
    [onChange]
  );

  // Handle text input change
  const handleTextChange = (newValue: string) => {
    setTextValue(newValue);
    debouncedChange(newValue);
  };

  // Handle color picker change
  const handlePickerChange = (pickerValue: string) => {
    setHexValue(pickerValue);
    
    // Convert to current format
    let newTextValue = '';
    if (format === 'HSL') {
      const hslString = hexToHslString(pickerValue);
      newTextValue = hslString || pickerValue;
    } else {
      newTextValue = pickerValue;
    }
    
    setTextValue(newTextValue);
    debouncedChange(newTextValue);
  };

  // Handle format switch
  const handleFormatChange = (newFormat: ColorFormat) => {
    setFormat(newFormat);
    
    // Convert current value to new format
    const hsl = parseColorToHsl(textValue);
    if (hsl) {
      if (newFormat === 'HSL') {
        setTextValue(formatHsl(hsl[0], hsl[1], hsl[2]));
      } else {
        setTextValue(hslToHex(hsl[0], hsl[1], hsl[2]));
      }
    }
  };

  // Preview color
  const previewColor = (() => {
    const hsl = parseColorToHsl(textValue);
    if (hsl) {
      return formatHslCss(hsl[0], hsl[1], hsl[2]);
    }
    if (textValue.startsWith('#')) {
      return textValue;
    }
    return '#cccccc';
  })();

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label className="font-medium">{label}</Label>
        {description && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{description}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {/* Format selector */}
        <Select value={format} onValueChange={handleFormatChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HSL">HSL</SelectItem>
            <SelectItem value="HEX">HEX</SelectItem>
          </SelectContent>
        </Select>
        
        {/* Text input */}
        <div className="flex-1 relative">
          <Input
            value={textValue}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={format === 'HSL' ? '29 59% 48%' : '#C17832'}
            className={`pr-12 ${!validation.isValid ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          {/* Color preview */}
          <div 
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded border border-border"
            style={{ backgroundColor: previewColor }}
          />
        </div>
        
        {/* Color picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="px-3">
              🎨
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2">
            <input
              type="color"
              value={hexValue}
              onChange={(e) => handlePickerChange(e.target.value)}
              className="w-20 h-8 border-0 rounded cursor-pointer"
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Validation error */}
      {!validation.isValid && (
        <div className="flex items-center gap-1 text-sm text-destructive">
          <AlertTriangle className="h-3 w-3" />
          <span>{validation.error}</span>
        </div>
      )}
      
      {/* Format help */}
      <div className="text-xs text-muted-foreground">
        {format === 'HSL' ? (
          <>Hue (0-360), Sättigung (0-100%), Helligkeit (0-100%). Z.B. <code>29 59% 48%</code></>
        ) : (
          <>Hexadezimal-Format. Z.B. <code>#C17832</code> oder <code>#C18</code></>
        )}
      </div>
    </div>
  );
}

// Simple debounce utility
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}