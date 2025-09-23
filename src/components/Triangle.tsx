interface TriangleProps {
  className?: string;
}

const Triangle = ({ className }: TriangleProps) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon points="50,15 100,100 0,100" />
    </svg>
  );
};

export default Triangle;
