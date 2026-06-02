export default function LibraryLoading() {
  return (
    <div className="relative flex min-h-screen flex-col bg-[#faf9f6]">
      <div className="animate-pulse px-[18px] pt-[22px] pb-4 min-[710px]:px-10">
        <div className="flex items-center justify-between gap-3.5 min-[710px]:hidden">
          <div className="h-[38px] w-[92px] shrink-0 rounded-[10px] bg-[#e4e1d9]" />
          <div className="flex min-w-0 flex-1 items-center justify-end gap-2.5">
            <div className="h-[38px] min-w-0 flex-1 rounded-[10px] bg-[#e4e1d9]" />
            <div className="size-[38px] shrink-0 rounded-[10px] bg-[#e4e1d9]" />
          </div>
        </div>
        <div className="hidden items-center justify-between gap-3.5 min-[710px]:flex">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[34px] w-20 rounded-full bg-[#e4e1d9]"
              />
            ))}
          </div>
          <div className="flex gap-2.5">
            <div className="h-[38px] w-[200px] rounded-[10px] bg-[#e4e1d9]" />
            <div className="size-[38px] rounded-[10px] bg-[#e4e1d9]" />
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-[42px] px-[18px] pb-[92px] min-[710px]:px-10">
        <div className="flex items-end justify-center gap-[7px]">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="rounded-sm bg-[#e4e1d9]"
              style={{ width: 40 + (i % 3) * 4, height: 188 + (i % 4) * 10 }}
            />
          ))}
        </div>
        <div className="mx-auto h-[11px] w-full max-w-4xl rounded-[7px] bg-[#e4e1d9]" />
      </div>
      <div className="absolute bottom-[22px] left-1/2 flex -translate-x-1/2 items-center gap-3.5 rounded-full border border-border bg-background px-3 py-[9px] pl-[18px]">
        <div className="h-5 w-16 rounded bg-[#e4e1d9]" />
        <div className="h-9 w-16 rounded-full bg-[#e4e1d9]" />
        <div className="size-9 rounded-full bg-[#e4e1d9]" />
      </div>
    </div>
  );
}
