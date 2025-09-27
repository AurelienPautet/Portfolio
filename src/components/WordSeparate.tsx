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
      className={`flex ${parentWidth}  h-fit flex-wrap justify-center items-center gap-${wordGap} ${parentClassName}`}
    >
      {text.split(" ").map((word, index) => (
        <Tag key={word + index} className={className + "h-fit"}>
          {word}
          {index < text.split(" ").length - 1 && " "}
        </Tag>
      ))}
    </div>
  );
};

export default WordSeparate;
