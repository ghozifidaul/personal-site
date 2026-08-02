import { useEffect, useState } from 'react';
import { useReducedMotion } from 'motion/react';

interface Props {
  lines: string[];
  className?: string;
}

const CHAR_INTERVAL = 120;
const LINE_DELAY = 400;
const CURSOR_BLINK_INTERVAL = 530;
const CURSOR_BLINK_COUNT = 3;

export default function TypewriterName({ lines, className }: Props) {
  const reduce = useReducedMotion();
  const [visibleChars, setVisibleChars] = useState<number[]>(
    reduce ? lines.map((line) => line.length) : lines.map(() => 0)
  );
  const [currentLine, setCurrentLine] = useState(reduce ? lines.length : 0);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [cursorFading, setCursorFading] = useState(false);

  useEffect(() => {
    if (reduce) return;

    let lineIndex = 0;
    let charIndex = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    const typeNextChar = () => {
      if (lineIndex >= lines.length) return;

      const lineText = lines[lineIndex];

      if (charIndex < lineText.length) {
        setVisibleChars((prev) => {
          const next = [...prev];
          next[lineIndex] = charIndex + 1;
          return next;
        });
        charIndex += 1;
        timeoutId = setTimeout(typeNextChar, CHAR_INTERVAL);
      } else {
        lineIndex += 1;
        charIndex = 0;
        setCurrentLine(lineIndex);

        if (lineIndex < lines.length) {
          timeoutId = setTimeout(typeNextChar, LINE_DELAY);
        } else {
          timeoutId = setTimeout(() => {
            setCursorFading(true);
          }, CURSOR_BLINK_INTERVAL * CURSOR_BLINK_COUNT);
        }
      }
    };

    timeoutId = setTimeout(typeNextChar, CHAR_INTERVAL);

    return () => clearTimeout(timeoutId);
  }, [lines, reduce]);

  useEffect(() => {
    if (reduce || currentLine >= lines.length || cursorFading) return;

    const intervalId = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, CURSOR_BLINK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [reduce, currentLine, lines.length, cursorFading]);

  const cursorLine = Math.min(currentLine, lines.length - 1);

  return (
    <h1 className={className}>
      {lines.map((line, index) => (
        <span key={index} className="block">
          {line.slice(0, visibleChars[index])}
          {index === cursorLine && !reduce && (
            <span
              className={`inline-block w-[2px] h-[0.85em] bg-current align-middle ml-1 transition-opacity duration-150 ease-in-out ${
                cursorFading
                  ? 'opacity-0 transition-opacity duration-300'
                  : cursorVisible
                    ? 'opacity-100'
                    : 'opacity-0'
              }`}
              aria-hidden="true"
            />
          )}
        </span>
      ))}
    </h1>
  );
}
