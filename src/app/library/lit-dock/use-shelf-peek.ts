"use client";

import { useEffect, useRef, useState } from "react";

const HINT_KEY = "albuc:shelf-peek-hint";
const SCRUB_THRESHOLD = 8;
const PAGE_SWIPE = 56;

function bookIdFromPoint(x: number, y: number): string | null {
  const el = document.elementFromPoint(x, y);
  return el?.closest("[data-book-id]")?.getAttribute("data-book-id") ?? null;
}

export function useShelfPeek() {
  const [peekedId, setPeekedId] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);
  const enabledRef = useRef(false);
  const suppressNavRef = useRef(false);
  const gestureRef = useRef<{
    pointerId: number;
    x: number;
    y: number;
    bookId: string | null;
  } | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(hover: none)");
    const sync = () => {
      enabledRef.current = media.matches;
      if (!media.matches) {
        setShowHint(false);
        return;
      }
      try {
        if (!localStorage.getItem(HINT_KEY)) {
          setShowHint(true);
        }
      } catch {
        setShowHint(true);
      }
    };

    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try {
      localStorage.setItem(HINT_KEY, "1");
    } catch {
      // private mode
    }
  };

  const onPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!enabledRef.current || event.pointerType === "mouse") return;

    const bookId = bookIdFromPoint(event.clientX, event.clientY);
    gestureRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      bookId,
    };
    suppressNavRef.current = false;

    if (bookId) {
      setPeekedId(bookId);
      dismissHint();
    }
  };

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;
    if (Math.hypot(dx, dy) > SCRUB_THRESHOLD && gesture.bookId) {
      suppressNavRef.current = true;
    }

    if (!gesture.bookId) return;

    const nextId = bookIdFromPoint(event.clientX, event.clientY);
    if (nextId) {
      setPeekedId(nextId);
    }
  };

  const onPointerUp = (
    event: React.PointerEvent<HTMLElement>,
    options: {
      page: number;
      pageCount: number;
      setPage: (page: number) => void;
    },
  ) => {
    const gesture = gestureRef.current;
    if (!gesture || gesture.pointerId !== event.pointerId) return;

    const dx = event.clientX - gesture.x;
    const dy = event.clientY - gesture.y;

    if (
      !gesture.bookId &&
      Math.abs(dx) > PAGE_SWIPE &&
      Math.abs(dx) > Math.abs(dy) * 1.4
    ) {
      if (dx < 0 && options.page < options.pageCount - 1) {
        options.setPage(options.page + 1);
        setPeekedId(null);
      } else if (dx > 0 && options.page > 0) {
        options.setPage(options.page - 1);
        setPeekedId(null);
      }
    }

    gestureRef.current = null;
    window.setTimeout(() => {
      suppressNavRef.current = false;
    }, 0);
  };

  const onBookClick = (event: React.MouseEvent) => {
    if (suppressNavRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  return {
    peekedId,
    showHint,
    dismissHint,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onBookClick,
  };
}
