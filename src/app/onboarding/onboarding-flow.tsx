"use client";

import {
  BookOpen,
  Check,
  ChevronRight,
  Loader,
  MessageSquare,
  NotebookPen,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/db/schema";
import { MIN_SEARCH_QUERY_LENGTH } from "@/lib/open-library";
import { type BookSearchResult, getCoverUrl } from "@/lib/open-library.shared";
import { cn } from "@/lib/utils";
import { addBookAction, searchBooksAction } from "../library/actions";
import { completeOnboardingAction, saveOnboardingNameAction } from "./actions";

type Step = "name" | "book" | "tour";

const STEPS: Step[] = ["name", "book", "tour"];

const TOUR = [
  {
    icon: BookOpen,
    title: "Your shelf",
    body: "Books stand as spines. On a phone, slide your thumb across them to see the covers. Tap one to open it.",
  },
  {
    icon: NotebookPen,
    title: "Notes in your words",
    body: "Write what stayed with you. Ask reads these notes — not the internet — so the answers stay yours.",
  },
  {
    icon: MessageSquare,
    title: "Ask with sources",
    body: "Ask a question about your reading. Answers come from your notes, with the book they came from.",
  },
] as const;

export function OnboardingFlow({ user }: { user: User }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(
    user.firstName && user.lastName ? "book" : "name",
  );
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  const [finishing, setFinishing] = useState(false);

  const stepIndex = STEPS.indexOf(step);

  const handleNameContinue = async () => {
    setSavingName(true);
    setNameError(null);
    const result = await saveOnboardingNameAction({ firstName, lastName });
    setSavingName(false);
    if (!result.success) {
      setNameError(result.error ?? "Could not save your name.");
      return;
    }
    setStep("book");
  };

  const handleFinish = async () => {
    setFinishing(true);
    const result = await completeOnboardingAction();
    if (!result.success) {
      setFinishing(false);
      return;
    }
    router.replace("/library");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#faf9f6] text-foreground">
      <header className="flex items-center justify-between px-6 pt-[max(1.5rem,env(safe-area-inset-top))] pb-2">
        <AlbucLogo className="text-xl" iconClassName="size-5" />
        <div className="flex items-center gap-1.5">
          {STEPS.map((item, index) => (
            <span
              key={item}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === stepIndex
                  ? "w-6 bg-foreground"
                  : index < stepIndex
                    ? "w-1.5 bg-foreground/45"
                    : "w-1.5 bg-foreground/15",
              )}
            />
          ))}
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[440px] flex-1 flex-col justify-center px-6 py-10">
        {step === "name" && (
          <NameStep
            firstName={firstName}
            lastName={lastName}
            error={nameError}
            saving={savingName}
            onFirstName={setFirstName}
            onLastName={setLastName}
            onContinue={handleNameContinue}
          />
        )}
        {step === "book" && (
          <BookStep
            firstName={firstName || user.firstName || ""}
            onSkip={() => setStep("tour")}
            onAdded={() => setStep("tour")}
          />
        )}
        {step === "tour" && (
          <TourStep finishing={finishing} onFinish={handleFinish} />
        )}
      </main>
    </div>
  );
}

function NameStep({
  firstName,
  lastName,
  error,
  saving,
  onFirstName,
  onLastName,
  onContinue,
}: {
  firstName: string;
  lastName: string;
  error: string | null;
  saving: boolean;
  onFirstName: (value: string) => void;
  onLastName: (value: string) => void;
  onContinue: () => void;
}) {
  const canContinue = firstName.trim().length > 0 && lastName.trim().length > 0;

  return (
    <div>
      <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Welcome
      </p>
      <h1 className="font-serif text-[34px] leading-[1.1] font-semibold tracking-tight">
        What should we call you?
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Just your name — so the library feels like yours.
      </p>

      <form
        className="mt-8 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (canContinue && !saving) onContinue();
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={firstName}
            onChange={(event) => onFirstName(event.target.value)}
            autoComplete="given-name"
            autoFocus
            className="h-11 bg-background"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={lastName}
            onChange={(event) => onLastName(event.target.value)}
            autoComplete="family-name"
            className="h-11 bg-background"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button
          type="submit"
          disabled={!canContinue || saving}
          className="mt-2 h-11 w-full text-[15px]"
        >
          {saving ? <Loader className="size-4 animate-spin" /> : "Continue"}
        </Button>
      </form>
    </div>
  );
}

function BookStep({
  firstName,
  onSkip,
  onAdded,
}: {
  firstName: string;
  onSkip: () => void;
  onAdded: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [addingKey, setAddingKey] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const latestQuery = useRef("");

  useEffect(() => {
    const trimmed = query.trim();
    latestQuery.current = trimmed;

    if (trimmed.length < MIN_SEARCH_QUERY_LENGTH) {
      setResults([]);
      setSearchError(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handle = window.setTimeout(async () => {
      const formData = new FormData();
      formData.append("query", trimmed);
      try {
        const result = await searchBooksAction({ results: [] }, formData);
        if (latestQuery.current !== trimmed) return;
        setResults(result.results);
        setSearchError(result.error ?? null);
      } catch {
        if (latestQuery.current !== trimmed) return;
        setResults([]);
        setSearchError("Could not reach the catalog. Try again in a moment.");
      } finally {
        if (latestQuery.current === trimmed) setIsSearching(false);
      }
    }, 350);

    return () => window.clearTimeout(handle);
  }, [query]);

  const handleAdd = async (book: BookSearchResult) => {
    setAddingKey(book.workKey);
    setAddError(null);

    const formData = new FormData();
    formData.append("workKey", book.workKey);
    formData.append("editionKey", book.editionKey || "");
    formData.append("title", book.title);
    formData.append("authors", JSON.stringify(book.authors));
    formData.append("authorKeys", JSON.stringify(book.authorKeys || []));
    formData.append("publishYear", book.publishYear?.toString() || "");
    formData.append("coverId", book.coverId?.toString() || "");
    formData.append("isbn10", JSON.stringify(book.isbn10 || []));
    formData.append("isbn13", JSON.stringify(book.isbn13 || []));
    formData.append("status", "WANT");
    formData.append("rating", "0");

    const result = await addBookAction({ success: false }, formData);
    setAddingKey(null);

    if (result.success) {
      onAdded();
      return;
    }

    setAddError(result.error ?? "Could not add that book.");
  };

  return (
    <div>
      <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        Your first book
      </p>
      <h1 className="font-serif text-[34px] leading-[1.1] font-semibold tracking-tight">
        {firstName ? `${firstName}, add a book` : "Add a book"}
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Optional — you can always do this from the shelf. One book is enough to
        start.
      </p>

      <div className="relative mt-8">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, author, or ISBN…"
          autoComplete="off"
          className="h-11 bg-background pl-9"
        />
      </div>

      <div className="mt-4 min-h-[220px]">
        {isSearching ? (
          <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
            <Loader className="mr-2 size-4 animate-spin" />
            Searching the catalog…
          </div>
        ) : results.length > 0 ? (
          <ul className="space-y-1">
            {results.slice(0, 8).map((book) => {
              const cover = getCoverUrl(book.coverId, "S");
              const adding = addingKey === book.workKey;
              return (
                <li key={book.workKey}>
                  <button
                    type="button"
                    onClick={() => handleAdd(book)}
                    disabled={addingKey !== null}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-background disabled:opacity-60"
                  >
                    <div className="flex h-11 w-[30px] shrink-0 items-center justify-center overflow-hidden rounded-[3px] bg-muted">
                      {cover ? (
                        <Image
                          src={cover}
                          alt=""
                          width={30}
                          height={44}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <BookOpen className="size-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-[14px] font-semibold">
                        {book.title}
                      </p>
                      <p className="truncate text-[12px] text-muted-foreground">
                        {book.authors.join(", ") || "Unknown author"}
                      </p>
                    </div>
                    {adding ? (
                      <Loader className="size-4 animate-spin text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-4 text-neutral-400" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : query.trim().length >= MIN_SEARCH_QUERY_LENGTH ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {searchError ?? "No books found. Try another title."}
          </p>
        ) : (
          <p className="py-10 text-center font-serif text-[16px] text-neutral-400 italic">
            Search the catalog to add your first book
          </p>
        )}
      </div>

      {addError && <p className="mt-2 text-sm text-destructive">{addError}</p>}

      <button
        type="button"
        onClick={onSkip}
        className="mt-4 w-full py-2 text-center text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        Skip for now
      </button>
    </div>
  );
}

function TourStep({
  finishing,
  onFinish,
}: {
  finishing: boolean;
  onFinish: () => void;
}) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        How Albuc works
      </p>
      <h1 className="font-serif text-[34px] leading-[1.1] font-semibold tracking-tight">
        A quiet place for what you read
      </h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        Three things, and that’s the whole product.
      </p>

      <ul className="mt-8 space-y-5">
        {TOUR.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-background">
              <item.icon className="size-4 text-foreground/80" />
            </span>
            <div>
              <p className="font-serif text-[17px] font-semibold">
                {item.title}
              </p>
              <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">
                {item.body}
              </p>
            </div>
          </li>
        ))}
      </ul>

      <Button
        type="button"
        onClick={onFinish}
        disabled={finishing}
        className="mt-10 h-11 w-full text-[15px]"
      >
        {finishing ? (
          <Loader className="size-4 animate-spin" />
        ) : (
          <>
            Start reading
            <Check className="size-4" />
          </>
        )}
      </Button>
    </div>
  );
}
