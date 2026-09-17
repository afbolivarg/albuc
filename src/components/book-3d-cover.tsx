import { BookOpen } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const COVER_RATIO = 282 / 188;

export type Book3dCoverProps = {
  src?: string | null;
  title?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  loading?: "eager" | "lazy";
};

export function Book3dCover({
  src,
  title,
  className,
  priority,
  sizes,
  width = 188,
  height,
  loading,
}: Book3dCoverProps) {
  const coverSrc = src?.trim() ? src : null;
  const imageHeight = height ?? Math.round(width * COVER_RATIO);

  return (
    <span className={cn("bk3d-scene w-full", className)} aria-hidden="true">
      <span className="bk3d">
        <span className="bk3d-back" />
        <span className="bk3d-inside">
          <span className="bk3d-page" />
          <span className="bk3d-page" />
          <span className="bk3d-page" />
        </span>
        <span className="bk3d-cover">
          {coverSrc ? (
            <Image
              src={coverSrc}
              alt={title ?? ""}
              width={width}
              height={imageHeight}
              unoptimized={coverSrc.startsWith("data:")}
              priority={priority}
              sizes={sizes}
              loading={priority ? undefined : loading}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center bg-muted">
              <BookOpen className="size-[42%] text-muted-foreground" />
            </span>
          )}
        </span>
        <span className="bk3d-effect" />
        <span className="bk3d-light" />
      </span>
    </span>
  );
}
