
type ComposePromptInput = {
  cardType: string;
  recipientName?: string;
  style: string;
  colorTheme: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  prompt?: string;
  customCardTitle?: string;
  customOccasion?: string;
  tone?: string;
  includeCustomMessage?: boolean;
  customMessageText?: string;
};

export function composeImagePrompt(data: ComposePromptInput) {
  const {
    cardType,
    recipientName,
    style,
    colorTheme,
    primaryColor,
    secondaryColor,
    accentColor,
    // prompt,
    customCardTitle,
    // customOccasion,
    tone,
    includeCustomMessage,
    customMessageText,
  } = data;

  // 1️⃣ Card title
  const title =
    cardType === "custom"
      ? customCardTitle || "Custom greeting card"
      : `${cardType} greeting card`;

  // 2️⃣ Recipient
  const recipientLine = recipientName
    ? `for ${recipientName}`
    : "";

  // 3️⃣ Custom message
  const messageLine =
    includeCustomMessage && customMessageText
      ? `Include short greeting text: "${customMessageText}"`
      : "No custom message text";

  // 4️⃣ Color handling
  const colorLine =
    colorTheme === "custom"
      ? `Use custom colors: primary ${primaryColor}, secondary ${secondaryColor}, accent ${accentColor}`
      : `Use ${colorTheme} color theme`;

  // 5️⃣ Final prompt
  return `
${title} ${recipientLine}

${style}, ${tone || "friendly"} mood,
professional greeting card design

${colorLine},
soft lighting,
balanced composition,
centered layout

Clear readable typography,
short greeting text only,
no handwriting style,
no paragraphs

${messageLine}

High quality,
print-ready,
sharp details,
smooth gradients,
no noise

Avoid blurry text,
avoid distorted letters,
avoid watermarks,
avoid logos,
avoid signatures
`.trim();
}
