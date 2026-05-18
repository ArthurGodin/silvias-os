import Image from "next/image";
import { cn } from "@/lib/utils";

type ImageCardProps = {
  src: string;
  alt: string;
  caption?: string;
  eyebrow?: string;
  aspect?: "4/5" | "3/4" | "16/10" | "1/1";
  priority?: boolean;
  className?: string;
  sizes?: string;
};

const aspectMap = {
  "4/5": "aspect-[4/5]",
  "3/4": "aspect-[3/4]",
  "16/10": "aspect-[16/10]",
  "1/1": "aspect-square",
};

export function ImageCard({
  src,
  alt,
  caption,
  eyebrow,
  aspect = "4/5",
  priority,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
}: ImageCardProps) {
  return (
    <figure className={cn("group", className)}>
      <div
        className={cn(
          "relative w-full overflow-hidden bg-ink-100",
          aspectMap[aspect],
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
        />
      </div>
      {(eyebrow || caption) && (
        <figcaption className="mt-4 flex items-baseline justify-between gap-4">
          {eyebrow && <span className="text-eyebrow">{eyebrow}</span>}
          {caption && (
            <span className="font-[family-name:var(--font-display)] italic text-[15px] text-ink-600 text-right">
              {caption}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
