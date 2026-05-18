type MarqueeBannerProps = {
  words?: string[];
  tone?: "ink" | "paper" | "gold";
};

const DEFAULT_WORDS = [
  "Estilo",
  "Personalidade",
  "Desde 2003",
  "Atelier",
  "Teresina",
  "Vinte e três anos",
  "Estilo",
  "Personalidade",
];

export function MarqueeBanner({
  words = DEFAULT_WORDS,
  tone = "paper",
}: MarqueeBannerProps) {
  const sequence = [...words, ...words];

  const bg =
    tone === "ink"
      ? "bg-ink-700 text-paper-100"
      : tone === "gold"
        ? "bg-[var(--color-gold)] text-paper-50"
        : "bg-paper-100 text-ink-700";

  return (
    <div
      className={`relative overflow-hidden border-y border-[var(--color-rule)] ${bg}`}
      aria-hidden
    >
      <div className="marquee-pause">
        <div className="marquee-track flex items-center whitespace-nowrap py-10 lg:py-14 will-change-transform">
          {sequence.map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="inline-flex items-center px-8 lg:px-14 text-[clamp(2.5rem,8vw,7rem)] leading-none"
            >
              <span
                className="font-[family-name:var(--font-display)] italic tracking-[-0.04em]"
                style={{ fontVariationSettings: "'SOFT' 100, 'WONK' 1, 'opsz' 144" }}
              >
                {word}
              </span>
              <span
                className="mx-6 lg:mx-10 text-[var(--color-gold)] opacity-80 select-none"
                aria-hidden
              >
                ✦
              </span>
            </span>
          ))}
        </div>
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-16 lg:w-32 bg-gradient-to-r from-[inherit] to-transparent"
        style={{ backgroundImage: `linear-gradient(to right, var(--color-paper-100), transparent)` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-16 lg:w-32"
        style={{ backgroundImage: `linear-gradient(to left, var(--color-paper-100), transparent)` }}
      />
    </div>
  );
}
