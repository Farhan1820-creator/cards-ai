import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface CustomMessageTextProps {
  enabled: boolean;
  message: string;
  onToggle: (enabled: boolean) => void;
  onMessageChange: (value: string) => void;
  maxLength?: number;
}

export const CustomMessageText = ({
  enabled,
  message,
  onToggle,
  onMessageChange,
  maxLength = 500,
}: CustomMessageTextProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Checkbox
          id="include-message"
          checked={enabled}
          onCheckedChange={(checked) => onToggle(checked === true)}
          className="mt-0.5"
        />
        <div className="space-y-1">
          <Label
            htmlFor="include-message"
            className="text-sm font-medium text-foreground cursor-pointer"
          >
            Include custom message text
          </Label>
          <p className="text-xs text-muted-foreground">
            Add your own message to appear on the card
          </p>
        </div>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          enabled ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="space-y-2 pt-2">
            <Label htmlFor="card-message" className="text-sm font-medium text-foreground">
              Your Message
            </Label>
            <Textarea
              id="card-message"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder="Write the message you want to appear on the card…"
              rows={5}
              maxLength={maxLength}
              className="resize-none bg-background border-input focus:border-primary"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground">
                {message.length}/{maxLength}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
