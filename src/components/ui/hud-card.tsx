export function HUDCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="hud-card">
      <dt className="hud-label">{label}</dt>
      <dd className="hud-value">{value}</dd>
    </div>
  );
}
