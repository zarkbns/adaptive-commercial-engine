import React, { useState, useEffect, useRef } from 'react';
import { FormattedMessage } from './FormattedMessage';

interface TypewriterMessageProps {
  fullText: string;
  isStreaming?: boolean;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterMessage: React.FC<TypewriterMessageProps> = ({
  fullText,
  isStreaming = false,
  className = '',
  onComplete,
}) => {
  const [displayedText, setDisplayedText] = useState(isStreaming ? '' : fullText);
  const targetTextRef = useRef(fullText);
  const displayedIndexRef = useRef(isStreaming ? 0 : fullText.length);
  const animationFrameRef = useRef<number | null>(null);

  targetTextRef.current = fullText;

  useEffect(() => {
    // If not streaming or already caught up, show fullText immediately
    if (!isStreaming) {
      setDisplayedText(fullText);
      displayedIndexRef.current = fullText.length;
      return;
    }

    let lastTime = performance.now();

    const animate = (now: number) => {
      const target = targetTextRef.current;
      const currentIdx = displayedIndexRef.current;

      if (currentIdx < target.length) {
        const delta = now - lastTime;

        // Smooth paced typewriter speed:
        // Calculate catch-up speed dynamically so it never lags behind large text bursts
        const remaining = target.length - currentIdx;
        // Step dynamically: 1 to 4 characters per frame (~30-60 chars/sec, fast but clearly readable cadence)
        let step = 1;
        if (remaining > 80) {
          step = Math.min(remaining, Math.ceil(remaining / 6));
        } else if (remaining > 30) {
          step = 3;
        } else if (remaining > 10) {
          step = 2;
        }

        // Advance roughly every 16-24ms
        if (delta >= 16) {
          const nextIdx = Math.min(currentIdx + step, target.length);
          displayedIndexRef.current = nextIdx;
          setDisplayedText(target.substring(0, nextIdx));
          lastTime = now;
        }

        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        if (!isStreaming) {
          onComplete?.();
        }
        animationFrameRef.current = null;
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [fullText, isStreaming, onComplete]);

  return (
    <div className={`relative ${className}`}>
      <FormattedMessage text={displayedText} />
      {isStreaming && displayedIndexRef.current < targetTextRef.current.length && (
        <span className="inline-block w-1.5 h-3.5 ml-0.5 bg-[#966035] animate-pulse align-middle rounded-xs" />
      )}
    </div>
  );
};
