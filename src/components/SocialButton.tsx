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
    >
      <Icon className="w-6 h-6" />
      {label}
    </a>
  );
};

export default SocialButton;
