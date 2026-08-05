type TeamCrestProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

export function TeamCrest({ src, alt, size = 24, className = "" }: TeamCrestProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={`shrink-0 rounded-sm object-contain ${className}`}
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.opacity = "0";
      }}
    />
  );
}
