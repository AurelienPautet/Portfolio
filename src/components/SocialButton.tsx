interface SocialButtonProps {
  Icon: React.ComponentType<{ className?: string }>;
  url: string;
  label: string;
  className?: string;
}

export const SocialButton = ({
  Icon,
  url,
  label,
  className = "",
}: SocialButtonProps) => {
  return (
    <a
      href={url}
      className={`flex items-center gap-2 ${className}`}
      target="_blank"
      rel="noopener noreferrer"
      draggable="false"
    >
      <Icon className="physical w-6 h-6" />
      <p className="physical">{label}</p>
    </a>
  );
};

export default SocialButton;
