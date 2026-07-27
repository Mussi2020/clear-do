import React from 'react';
import { ExternalLink } from 'lucide-react';

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

export const LinkifiedText: React.FC<LinkifiedTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Regex to match URLs starting with http://, https://, or www.
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

  const parts = text.split(urlRegex);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(urlRegex)) {
          const href = part.startsWith('www.') ? `https://${part}` : part;
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 underline font-medium break-all px-1 py-0.2 bg-indigo-50/80 hover:bg-indigo-100 rounded text-[11px] transition-colors"
              title={`打开链接: ${href}`}
            >
              <span>{part}</span>
              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
            </a>
          );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
