import { LandingFooter } from "./landing-footer";
import { LandingHeader } from "./landing-header";

export default function LandingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 flex flex-col">
        <LandingHeader />
        <main className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col gap-16 md:gap-32">
            {children}
          </div>
        </main>
      </div>
      <LandingFooter />
    </div>
  );
}
