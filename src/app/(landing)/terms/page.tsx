import type { Metadata } from "next";
import { LandingFooter } from "@/components/landing-footer";
import { LandingNav } from "@/components/landing-nav";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms of use for Albuc.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen max-w-3xl mx-auto p-4 md:p-6 space-y-12">
      <Card className="bg-muted rounded-xl shadow-none border-none">
        <CardContent className="p-4 md:p-8 space-y-8">
          <LandingNav />

          <article className="space-y-6 text-foreground">
            <h1 className="text-3xl font-serif font-bold tracking-tight">
              Terms
            </h1>

            <p className="text-muted-foreground leading-relaxed">
              Albuc is a free service for managing your personal book library
              and notes. By using it, you agree to these simple terms.
            </p>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Use it responsibly</h2>
              <p className="text-muted-foreground leading-relaxed">
                Don&apos;t abuse the service, spam signups, or try to break it.
                Don&apos;t upload illegal content. Your account is for your
                personal use.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">No guarantees</h2>
              <p className="text-muted-foreground leading-relaxed">
                Albuc is provided as-is. I do my best to keep it running, but
                there&apos;s no uptime guarantee. AI answers may be wrong —
                always trust your own reading over what Ask returns.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                I may suspend or remove accounts that violate these terms or
                abuse the service. The service may change or shut down —
                I&apos;ll try to give reasonable notice if that ever happens.
              </p>
            </section>

            <p className="text-sm text-muted-foreground">
              That&apos;s it. Read books, take notes, build ideas.
            </p>
          </article>
        </CardContent>
      </Card>

      <LandingFooter />
    </div>
  );
}
