"use client";

import { BookOpen } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
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
  revealOnLoad?: boolean;
};

function skipOptimize(src: string) {
  return src.startsWith("data:") || src.includes("covers.openlibrary.org");
}

export function Book3dCover({
  src,
  title,
  className,
  priority,
  sizes,
  width = 188,
  height,
  loading,
  revealOnLoad = false,
}: Book3dCoverProps) {
  const coverSrc = src?.trim() ? src : null;
  const imageHeight = height ?? Math.round(width * COVER_RATIO);
  const [imageReady, setImageReady] = useState(!revealOnLoad);

  useEffect(() => {
    if (!revealOnLoad) {
      setImageReady(true);
      return;
    }
    if (!coverSrc) {
      setImageReady(false);
      return;
    }

    const probe = new window.Image();
    probe.src = coverSrc;
    setImageReady(probe.complete && probe.naturalWidth > 0);
  }, [coverSrc, revealOnLoad]);

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
              unoptimized={skipOptimize(coverSrc)}
              priority={priority}
              sizes={sizes}
              loading={priority ? undefined : loading}
              onLoad={() => setImageReady(true)}
              className={cn(
                "h-full w-full object-cover",
                revealOnLoad && "transition-opacity duration-200",
                revealOnLoad && !imageReady && "opacity-0",
              )}
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
