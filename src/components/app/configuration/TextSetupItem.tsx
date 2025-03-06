import { openUrl } from '@tauri-apps/plugin-opener';

interface TextSetupItemProps {
  label: string;
  value: string;
}

/**
 * Parses a string for markdown-style links [text](href) and returns an array of React elements
 * with proper handling for Tauri apps.
 */
function parseMarkdownLinks(text: string) {
  if (!text) return [];

  // Regular expression to match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  const parts: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let match;
  
  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    const [fullMatch, linkText, linkUrl] = match;
    parts.push(
      <button 
        key={match.index} 
        onClick={() => openUrl(linkUrl)}
        className="text-blue-600 hover:underline dark:text-blue-400 font-normal p-0 bg-transparent border-none cursor-pointer"
      >
        {linkText}
      </button>
    );
    
    lastIndex = match.index + fullMatch.length;
  }
  
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts;
}

export function TextSetupItem({ label, value }: TextSetupItemProps) {
  const parsedContent = parseMarkdownLinks(value);
  
  return (
    <div className="flex flex-col gap-2">
      <p className="text-base font-medium">{label}</p>
      <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {parsedContent.length > 0 ? parsedContent : value}
      </p>
    </div>
  );
}

export type { TextSetupItemProps }; 