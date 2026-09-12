import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 32,
        background: "#020617",
        border: "8px solid #22d3ee",
        color: "#eaf5ff",
        fontSize: 104,
        fontWeight: 800,
        fontFamily: "monospace",
      }}
    >
      A
    </div>,
    size,
  );
}
