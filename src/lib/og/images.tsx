import {
  OG_INK,
  OG_MUTED,
  OgAlbucLogo,
  OgBookCover,
  OgCanvas,
  OgLines,
} from "./elements";
import { charsPerLine, clampOgLine, clampOgLines } from "./text";

const NOTE_TEXT_WIDTH = 620;
const PROFILE_TEXT_WIDTH = 980;

export function ProfileOgImage({ title }: { title: string }) {
  const fontSize = 72;
  const lines = clampOgLines(
    title,
    charsPerLine(fontSize, PROFILE_TEXT_WIDTH),
    2,
  );

  return (
    <OgCanvas>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: 72,
        }}
      >
        <OgAlbucLogo size={44} />
        <OgLines
          color={OG_INK}
          fontFamily="EB Garamond"
          fontSize={fontSize}
          fontWeight={700}
          letterSpacing={-1.2}
          lines={lines}
        />
      </div>
    </OgCanvas>
  );
}

export function NoteOgImage({
  eyebrow,
  title,
  authors,
  coverSrc,
}: {
  eyebrow: string;
  title: string;
  authors: string | null;
  coverSrc: string | null;
}) {
  const titleSize = 64;
  const titleLines = clampOgLines(
    title,
    charsPerLine(titleSize, NOTE_TEXT_WIDTH),
    2,
  );
  const authorLine = authors
    ? clampOgLine(authors, charsPerLine(26, NOTE_TEXT_WIDTH))
    : null;

  return (
    <OgCanvas>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          height: "100%",
          padding: 72,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            width: NOTE_TEXT_WIDTH,
            height: "100%",
            paddingRight: 36,
          }}
        >
          <OgAlbucLogo size={52} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "Geist",
                fontSize: 28,
                fontWeight: 500,
                color: OG_MUTED,
                lineHeight: 1.3,
              }}
            >
              {eyebrow}
            </div>
            <OgLines
              color={OG_INK}
              fontFamily="EB Garamond"
              fontSize={titleSize}
              fontWeight={700}
              letterSpacing={-1.1}
              lines={titleLines}
            />
            {authorLine ? (
              <div
                style={{
                  display: "flex",
                  fontFamily: "Geist",
                  fontSize: 26,
                  fontWeight: 400,
                  color: OG_MUTED,
                  lineHeight: 1.3,
                }}
              >
                {authorLine}
              </div>
            ) : null}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <OgBookCover src={coverSrc} title={title} width={268} />
        </div>
      </div>
    </OgCanvas>
  );
}
