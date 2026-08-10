import type { ReactNode } from "react";

export function Terminal({
  abaLable,
  prompt,
  children,
}: {
  abaLable?: string;
  prompt?: string;
  children: ReactNode;
}) {
  return (
    <div className="terminal-frame">
      {(abaLable || prompt) && (
        <div className="terminal-bar" aria-hidden="true">
          {abaLable && <span className="terminal-tab">{abaLable}</span>}
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
