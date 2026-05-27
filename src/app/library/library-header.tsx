import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlbucLogo } from "@/components/albuc-logo";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/db/queries";
import { UserMenu } from "./user-menu";

export async function LibraryHeader() {
  const user = await getUser();

  if (!user) {
    redirect("/");
  }

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/library"
          className="flex items-center space-x-2 cursor-pointer select-none"
          tabIndex={0}
          aria-label="Go to Library"
        >
          <AlbucLogo className="select-none" />
        </Link>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="sm">
            <Link href="/library/ask" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Ask
            </Link>
          </Button>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
