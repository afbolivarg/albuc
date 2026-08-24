export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">{children}</div>
    </main>
  );
}
