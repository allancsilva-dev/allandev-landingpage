export function Marquee({
  items,
  direction = "left",
  speed = 40,
}: {
  items: readonly string[];
  direction?: "left" | "right";
  speed?: number;
}) {
  const content = items.join(" · ");
  return (
    // Decorative on purpose: the readable stack list lives in the Sobre section,
    // so a screen reader never has to sit through a scrolling ticker.
    <div className="marquee" aria-hidden="true">
      <div
        className={`marquee-track marquee-${direction}`}
        style={{ animationDuration: `${speed}s` }}
      >
        {/* Duplicated so translateX(-50%) loops without a visible seam. */}
        <span>{content}</span>
        <span>{content}</span>
      </div>
    </div>
  );
}
