import type { ReactNode } from "react";

export function Terminal({
  abaLabel,
  prompt,
  children,
}: {
  abaLabel?: string;
  prompt?: string;
  children: ReactNode;
}) {
  return (
    <div className="terminal-frame">
      {(abaLabel || prompt) && (
        <div className="terminal-bar" aria-hidden="true">
          {abaLabel && <span className="terminal-tab">{abaLabel}</span>}
        </div>
      )}
      {prompt && (
        <p className="terminal-prompt" aria-hidden="true">
          {prompt}
          <span className="terminal-cursor" />
        </p>
      )}
      <div className="terminal-body">{children}</div>
    </div>
  );
}
