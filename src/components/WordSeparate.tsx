import type { JSX } from "react";

interface WordSeparateProps {
  text: string;
  htmlTag?: keyof JSX.IntrinsicElements;
  wordGap?: number;
  className?: string;
}

const WordSeparate = ({
  text,
  htmlTag: Tag = "span",
  wordGap = 2,
  className,
}: WordSeparateProps) => {
  return (
    <div
      className={`flex w-full h-fit flex-wrap justify-center items-center gap-${wordGap}`}
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
