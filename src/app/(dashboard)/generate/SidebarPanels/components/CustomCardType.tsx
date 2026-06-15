import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

export type ToneType = "formal" | "friendly" | "fun" | "emotional" | "professional";

interface CustomCardTypeProps {
  cardTitle: string;
  occasionDescription: string;
  tone: ToneType;
  includeCustomMessage: boolean;
  onCardTitleChange: (value: string) => void;
  onOccasionDescriptionChange: (value: string) => void;
  onToneChange: (value: ToneType) => void;
  onIncludeCustomMessageChange: (value: boolean) => void;
}

const toneOptions: { value: ToneType; label: string }[] = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "fun", label: "Fun" },
  { value: "emotional", label: "Emotional" },
  { value: "professional", label: "Professional" },
];

export const CustomCardType = ({
  cardTitle,
  occasionDescription,
  tone,
  includeCustomMessage,
  onCardTitleChange,
  onOccasionDescriptionChange,
  onToneChange,
  onIncludeCustomMessageChange,
}: CustomCardTypeProps) => {
  return (
    <div className="space-y-5">
      <div>
        <Label className="text-sm font-medium text-foreground">
          Custom Card Details
        </Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tell us what kind of card you want to create
        </p>
      </div>

      <div className="space-y-4">
        {/* Card Title */}
        <div className="space-y-2">
          <Label htmlFor="card-title" className="text-sm text-foreground">
            Card Title
          </Label>
          <Input
            id="card-title"
            type="text"
            value={cardTitle}
            onChange={(e) => onCardTitleChange(e.target.value)}
            placeholder="e.g. Farewell Card for a Colleague"
            className="bg-background"
          />
        </div>

        {/* Occasion Description */}
        <div className="space-y-2">
          <Label htmlFor="occasion-description" className="text-sm text-foreground">
            Occasion Description
          </Label>
          <Textarea
            id="occasion-description"
            value={occasionDescription}
            onChange={(e) => onOccasionDescriptionChange(e.target.value)}
            placeholder="Describe the occasion, mood, and audience…"
            className="min-h-20 resize-none bg-background"
          />
        </div>

        {/* Tone Selector */}
        <div className="space-y-2">
          <Label className="text-sm text-foreground">Tone</Label>
          <div className="flex flex-wrap gap-2">
            {toneOptions.map((option) => (
              <Button
                key={option.value}
                type="button"
                variant={tone === option.value ? "pill-active" : "pill"}
                size="sm"
                onClick={() => onToneChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Include Custom Message Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3">
          <div className="space-y-0.5">
            <Label htmlFor="include-message" className="text-sm font-medium text-foreground cursor-pointer">
              Include custom message text
            </Label>
            <p className="text-xs text-muted-foreground">
              Add your own message in the card design
            </p>
          </div>
          <Switch
            id="include-message"
            checked={includeCustomMessage}
            onCheckedChange={onIncludeCustomMessageChange}
          />
        </div>
      </div>
    </div>
  );
};
