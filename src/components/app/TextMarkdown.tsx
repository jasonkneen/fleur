import { openUrl } from '@tauri-apps/plugin-opener';
import { invoke } from '@tauri-apps/api/core';

interface TextMarkdownProps {
  text: string;
  className?: string;
}

function isAppProtocolUrl(url: string): boolean {
  return /^(?!http|https|ftp)\w+:\/\//.test(url);
}

async function openUrlWithFallback(url: string) {
  if (isAppProtocolUrl(url)) {
    try {
      await invoke('open_system_url', { url });
    } catch (error) {
      console.error(`Failed to open app URL with system command: ${error}`);
      
      try {
        await openUrl(url);
      } catch (secondError) {
        console.error(`Failed to open app URL with openUrl: ${secondError}`);
        
        window.open(url, '_blank');
      }
    }
  } else {
    try {
      await openUrl(url);
    } catch (error) {
      console.error(`Failed to open URL: ${error}`);
      window.open(url, '_blank');
    }
  }
}

function parseMarkdownLinks(text: string): (string | JSX.Element)[] {
  if (!text) return [];

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
        key={`link-${match.index}`} 
        onClick={() => openUrlWithFallback(linkUrl)}
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

function parseLineBreaks(content: (string | JSX.Element)[]): (string | JSX.Element)[] {
  if (!content.length) return content;
  
  const parts: (string | JSX.Element)[] = [];
  let keyCounter = 0;
  
  content.forEach(item => {
    if (typeof item === 'string' && item.includes('\n')) {
      const lines = item.split('\n');
      
      lines.forEach((line, index) => {
        parts.push(line);
        if (index < lines.length - 1) {
          parts.push(<br key={`br-${keyCounter++}`} />);
        }
      });
    } else {
      parts.push(item);
    }
  });
  
  return parts;
}

export function TextMarkdown({ text, className = "" }: TextMarkdownProps) {
  const parsedContent = parseLineBreaks(parseMarkdownLinks(text));
  
  return <p className={className}>{parsedContent.length > 0 ? parsedContent : text}</p>;
}

export type { TextMarkdownProps };