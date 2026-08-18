export default function BookLoading() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="container mx-auto animate-pulse space-y-6 px-6 py-8 pt-[max(2rem,env(safe-area-inset-top,0px))]">
        <div className="h-10 w-3/4 rounded bg-muted" />
        <div className="h-4 w-1/2 rounded bg-muted" />
        <div className="h-64 rounded-lg bg-muted" />
      </div>
    </div>
  );
}
