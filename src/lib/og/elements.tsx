import { APP_NAME } from "@/lib/pwa";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_BG = "#faf9f6";
export const OG_INK = "#1c1917";
export const OG_MUTED = "#57534e";

const COVER_RATIO = 282 / 188;

export function OgAlbucLogo({
  size = 40,
  showWordmark = true,
}: {
  size?: number;
  showWordmark?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: Math.round(size * 0.32),
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
          stroke={OG_INK}
          strokeWidth="2"
        />
        <path
          d="M7 7v10"
          stroke={OG_INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M11 7v10"
          stroke={OG_INK}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="m15 7 2 10"
          stroke={OG_INK}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showWordmark ? (
        <div
          style={{
            display: "flex",
            fontFamily: "EB Garamond",
            fontSize: Math.round(size * 0.82),
            fontWeight: 700,
            color: OG_INK,
            letterSpacing: -0.4,
            lineHeight: 1,
          }}
        >
          {APP_NAME}
        </div>
      ) : null}
    </div>
  );
}

export function OgBookCover({
  src,
  title,
  width = 280,
}: {
  src: string | null;
  title: string;
  width?: number;
}) {
  const height = Math.round(width * COVER_RATIO);
  const radius = Math.max(4, Math.round(width * 0.028));

  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width,
        height,
      }}
    >
      <div
        style={{
          width,
          height,
          display: "flex",
          overflow: "hidden",
          background: "#e7e5e4",
          borderRadius: `${Math.round(radius * 0.4)}px ${radius}px ${radius}px ${Math.round(radius * 0.4)}px`,
          boxShadow:
            "0 14px 32px rgba(28, 25, 23, 0.16), 0 3px 8px rgba(28, 25, 23, 0.06)",
        }}
      >
        {src ? (
          // biome-ignore lint/performance/noImgElement: ImageResponse cannot use next/image
          <img
            alt=""
            src={src}
            width={width}
            height={height}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
              background: "#e7e5e4",
              color: OG_MUTED,
              fontFamily: "EB Garamond",
              fontSize: 26,
              fontWeight: 600,
              textAlign: "center",
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: Math.round(width * 0.05),
          height,
          background:
            "linear-gradient(90deg, rgba(28,25,23,0.22), rgba(28,25,23,0))",
        }}
      />
    </div>
  );
}

export function OgCanvas({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: OG_BG,
        color: OG_INK,
      }}
    >
      {children}
    </div>
  );
}

export function OgLines({
  lines,
  fontSize,
  fontFamily,
  fontWeight,
  color,
  letterSpacing,
  lineHeight = 1.05,
}: {
  lines: string[];
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  letterSpacing?: number;
  lineHeight?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        fontFamily,
        fontSize,
        fontWeight,
        color,
        letterSpacing,
        lineHeight,
      }}
    >
      {lines.map((line) => (
        <div key={line} style={{ display: "flex" }}>
          {line}
        </div>
      ))}
    </div>
  );
}
