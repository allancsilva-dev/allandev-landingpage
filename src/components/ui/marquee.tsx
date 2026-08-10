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
    <div
      className="marquee marquee-double"
      aria-label={`Tecnologias: ${content}`}
    >
      <div
        className={`marquee-track marquee-${direction}`}
        style={{ animationDuration: `${speed}s` }}
      >
        <span>{content}</span>
        <span aria-hidden="true">{content}</span>
      </div>
    </div>
  );
}
