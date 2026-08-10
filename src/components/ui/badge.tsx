export function Badge({
  variant = "available",
  children,
}: {
  variant?: "available" | "progress" | "delivered";
  children: string;
}) {
  return (
    <p className={`badge badge-${variant}`}>
      {variant === "available" && (
        <span className="badge-dot" aria-hidden="true" />
      )}
      {children}
    </p>
  );
}
