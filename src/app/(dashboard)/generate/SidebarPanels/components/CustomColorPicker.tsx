import { Label } from "@/components/ui/label";

interface CustomColorPickerProps {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  onPrimaryChange: (color: string) => void;
  onSecondaryChange: (color: string) => void;
  onAccentChange: (color: string) => void;
}

export const CustomColorPicker = ({
  primaryColor,
  secondaryColor,
  accentColor,
  onPrimaryChange,
  onSecondaryChange,
  onAccentChange,
}: CustomColorPickerProps) => {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-foreground">Custom Colors</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Choose your own color palette
        </p>
      </div>

      <div className="space-y-3">
        {/* Primary Color */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onPrimaryChange(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none"
            />
          </div>
          <div className="flex-1">
            <span className="text-sm text-foreground">Primary</span>
          </div>
          <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
            {primaryColor.toUpperCase()}
          </code>
        </div>

        {/* Secondary Color */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => onSecondaryChange(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none"
            />
          </div>
          <div className="flex-1">
            <span className="text-sm text-foreground">Secondary</span>
          </div>
          <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
            {secondaryColor.toUpperCase()}
          </code>
        </div>

        {/* Accent Color */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onAccentChange(e.target.value)}
              className="h-9 w-9 cursor-pointer rounded-md border border-border bg-transparent p-0.5 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-none"
            />
          </div>
          <div className="flex-1">
            <span className="text-sm text-foreground">Accent</span>
            <span className="ml-1.5 text-xs text-muted-foreground">(optional)</span>
          </div>
          <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-muted-foreground">
            {accentColor.toUpperCase()}
          </code>
        </div>
      </div>

      {/* Preview */}
      <div className="pt-2">
        <span className="text-xs text-muted-foreground mb-2 block">Preview</span>
        <div
          className="h-12 w-full rounded-lg border border-border"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 50%, ${accentColor} 100%)`,
          }}
        />
      </div>
    </div>
  );
};
