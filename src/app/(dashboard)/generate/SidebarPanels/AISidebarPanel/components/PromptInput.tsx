import { Textarea } from "@/components/ui/textarea";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function PromptInput({ value, onChange }: PromptInputProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="prompt" className="text-sm font-medium text-foreground">
        Describe your card
      </label>
      <Textarea
        id="prompt"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="A modern birthday card with soft pastel colors and elegant typography..."
        className="min-h-30 resize-none bg-card text-base shadow-sm transition-shadow focus:shadow-md"
      />
      <p className="text-xs text-muted-foreground">
        {`Be specific about colors, style, and any text you'd like included.`}
      </p>
    </div>
  );
}
