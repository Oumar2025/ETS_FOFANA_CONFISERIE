import React from 'react';

interface RichChatMessageProps {
  text: string;
}

function parseInlineStyles(str: string): React.ReactNode[] {
  // Split by **bold**, `code`, or *italic*
  const parts = str.split(/(\*\*.*?\*\*|`.*?`|\*.*?\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-extrabold text-amber-300">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <span
          key={i}
          className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono mx-0.5"
        >
          {part.slice(1, -1)}
        </span>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={i} className="text-slate-400 font-medium not-italic">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

export const RichChatMessage: React.FC<RichChatMessageProps> = ({ text }) => {
  const lines = text.split('\n');

  return (
    <div className="space-y-2 text-xs leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        // Header ###
        if (trimmed.startsWith('###')) {
          const title = trimmed.replace(/^###\s*/, '');
          return (
            <div key={idx} className="pt-2 pb-1 border-b border-slate-800/80 mb-1">
              <h3 className="font-black text-amber-400 text-sm tracking-tight flex items-center space-x-2">
                <span>{parseInlineStyles(title)}</span>
              </h3>
            </div>
          );
        }

        // Bullet point - or *
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const content = trimmed.replace(/^[-*]\s*/, '');
          return (
            <div key={idx} className="flex items-start space-x-2.5 my-1 text-slate-200 pl-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0 shadow-gold-glow" />
              <div className="flex-1 leading-relaxed">{parseInlineStyles(content)}</div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-slate-300 leading-relaxed my-1">
            {parseInlineStyles(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
