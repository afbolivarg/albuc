import { ImageResponse } from "next/og";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/pwa";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#faf9f6",
        color: "#1c1917",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}
      >
        {APP_NAME}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
          }}
        >
          <span>Don&apos;t just read.</span>
          <span>Build ideas.</span>
        </div>
        <div style={{ fontSize: 28, color: "#57534e", maxWidth: 820 }}>
          {APP_DESCRIPTION}
        </div>
      </div>
    </div>,
    size,
  );
}
