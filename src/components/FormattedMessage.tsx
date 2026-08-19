import React from 'react';

interface FormattedMessageProps {
  text: string;
  className?: string;
}

export const FormattedMessage: React.FC<FormattedMessageProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split lines to preserve structural blocks
  const lines = text.split('\n');

  const renderInlineFormatted = (rawText: string): React.ReactNode[] => {
    // Matches **bold text** or *italic/bold* or `code`
    // Process markdown tags into clean React nodes
    const parts: React.ReactNode[] = [];
    let current = rawText;
    let keyIdx = 0;

    while (current.length > 0) {
      // Check for **bold**
      const boldMatch = current.match(/\*\*(.*?)\*\*/);
      // Check for `code`
      const codeMatch = current.match(/`(.*?)`/);

      let firstMatch: { type: 'bold' | 'code'; match: RegExpMatchArray; index: number } | null = null;

      if (boldMatch && boldMatch.index !== undefined) {
        firstMatch = { type: 'bold', match: boldMatch, index: boldMatch.index };
      }
      if (codeMatch && codeMatch.index !== undefined) {
        if (!firstMatch || codeMatch.index < firstMatch.index) {
          firstMatch = { type: 'code', match: codeMatch, index: codeMatch.index };
        }
      }

      if (!firstMatch) {
        // Clean any leftover raw stray formatting symbols
        const cleanRemaining = current.replace(/\*\*/g, '');
        parts.push(<span key={`txt-${keyIdx++}`}>{cleanRemaining}</span>);
        break;
      }

      // Add text before match
      if (firstMatch.index > 0) {
        const preText = current.substring(0, firstMatch.index).replace(/\*\*/g, '');
        parts.push(<span key={`pre-${keyIdx++}`}>{preText}</span>);
      }

      // Add matched styled node
      if (firstMatch.type === 'bold') {
        const innerContent = firstMatch.match[1].replace(/\*\*/g, '');
        parts.push(
          <strong key={`bold-${keyIdx++}`} className="font-semibold text-zinc-900 dark:text-zinc-50">
            {innerContent}
          </strong>
        );
      } else if (firstMatch.type === 'code') {
        parts.push(
          <code
            key={`code-${keyIdx++}`}
            className="px-1.5 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-mono text-[11px]"
          >
            {firstMatch.match[1]}
          </code>
        );
      }

      current = current.substring(firstMatch.index + firstMatch.match[0].length);
    }

    return parts;
  };

  const renderedBlocks: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];

  const flushList = () => {
    if (currentList.length > 0) {
      renderedBlocks.push(
        <ul key={`list-${renderedBlocks.length}`} className="space-y-1.5 my-2 pl-4 list-disc marker:text-[#966035]">
          {currentList}
        </ul>
      );
      currentList = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i].trim();

    // Horizontal divider ---
    if (rawLine === '---' || rawLine === '***' || rawLine === '___') {
      flushList();
      renderedBlocks.push(
        <div key={`hr-${i}`} className="my-3 border-t border-zinc-200/80 dark:border-zinc-700/60" />
      );
      continue;
    }

    // Empty line
    if (!rawLine) {
      flushList();
      renderedBlocks.push(<div key={`space-${i}`} className="h-1.5" />);
      continue;
    }

    // Headings: ### Heading or ## Heading or # Heading
    const headingMatch = rawLine.match(/^(#{1,4})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      renderedBlocks.push(
        <div
          key={`h-${i}`}
          className={`font-bold text-zinc-900 dark:text-white mt-3 mb-1.5 ${
            level <= 2 ? 'text-sm sm:text-base border-b border-zinc-100 dark:border-zinc-800 pb-1' : 'text-xs sm:text-sm'
          }`}
        >
          {renderInlineFormatted(headingText)}
        </div>
      );
      continue;
    }

    // Bullet list items: * or - or + or numbered 1. 2.
    const listMatch = rawLine.match(/^(\*|\-|\+|\d+\.)\s+(.*)$/);
    if (listMatch) {
      const content = listMatch[2];
      currentList.push(
        <li key={`li-${i}`} className="leading-relaxed">
          {renderInlineFormatted(content)}
        </li>
      );
      continue;
    }

    // Regular paragraph line
    flushList();
    renderedBlocks.push(
      <p key={`p-${i}`} className="leading-relaxed my-1">
        {renderInlineFormatted(rawLine)}
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{renderedBlocks}</div>;
};
