import type { ReactNode } from "react";
import { Reveal } from "./reveal";

export function Section({
  id,
  className,
  labelledBy,
  children,
}: {
  id?: string;
  className?: string;
  labelledBy?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={className ?? "section"}
      id={id}
      aria-labelledby={labelledBy}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  titleId,
  lede,
  action,
  className = "section-heading",
  reveal = true,
}: {
  eyebrow?: string;
  title: string;
  /** Pairs with `Section labelledBy` so each section names itself. */
  titleId?: string;
  lede?: string;
  action?: ReactNode;
  className?: string;
  reveal?: boolean;
}) {
  // Reveal carries the same className, so no extra grid item appears.
  const Wrapper = reveal ? Reveal : "div";
  return (
    <Wrapper className={className}>
      {eyebrow && <p>{eyebrow}</p>}
      <h2 id={titleId}>{title}</h2>
      {lede && <span>{lede}</span>}
      {action}
    </Wrapper>
  );
}
