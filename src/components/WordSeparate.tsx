import type { JSX } from "react";

interface WordSeparateProps {
  text: string;
  htmlTag?: keyof JSX.IntrinsicElements;
  wordGap?: number;
  className?: string;
  parentClassName?: string;
  parentWidth?: string;
}

const WordSeparate = ({
  text,
  htmlTag: Tag = "span",
  wordGap = 2,
  className = "",
  parentClassName = "",
  parentWidth = "w-full",
}: WordSeparateProps) => {
  return (
    <div
      className={`flex ${parentWidth} h-fit flex-wrap justify-center items-center ${parentClassName}`}
      style={{ gap: `${wordGap * 0.5}rem` }}
    >
      {text.trim().split(/\s+/).filter(Boolean).map((word, index) => (
        <Tag key={word + index} className={className + " h-fit"}>
          {word}
        </Tag>
      ))}
    </div>
  );
};

export default WordSeparate;
