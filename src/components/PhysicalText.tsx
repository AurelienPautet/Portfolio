import { Fragment } from "react";
import type { JSX } from "react";

interface PhysicalTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  wordClassName?: string;
}

/**
 * Text where every word is its own physics body. Words are inline-block spans
 * (CSS transforms do not apply to plain inline boxes) separated by ordinary
 * spaces, so the text wraps and aligns exactly like normal running text.
 */
const PhysicalText = ({
  text,
  as: Tag = "span",
  className = "",
  wordClassName = "",
}: PhysicalTextProps) => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  return (
    <Tag className={className}>
      {words.map((word, index) => (
        <Fragment key={index}>
          {index > 0 && " "}
          <span className={`physical inline-block ${wordClassName}`}>{word}</span>
        </Fragment>
      ))}
    </Tag>
  );
};

export default PhysicalText;
