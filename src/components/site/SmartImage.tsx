import { useMediaSrc } from "@/lib/studio";
import { cn } from "@/lib/utils";

type Props = {
  reference: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
};

export function SmartImage({ reference, alt, className, eager }: Props) {
  const src = useMediaSrc(reference);

  if (!src) {
    return <div className={cn("animate-pulse bg-surface-2", className)} aria-hidden />;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={className}
    />
  );
}
