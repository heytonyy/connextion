// Placeholder board shown while a puzzle loads, same footprint as Grid
export default function LoadingBoard() {
  return (
    <div
      role="status"
      aria-label="Loading puzzle"
      className="flex w-[360px] flex-col gap-2 sm:w-[420px] sm:gap-4 md:w-[600px]"
    >
      <p className="my-2 text-center text-gray-500 sm:text-lg">
        Loading puzzle...
      </p>
      <div className="grid w-full grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            className="h-[48px] animate-pulse bg-indigo-200 md:h-[60px]"
            style={{ animationDelay: `${(i % 4) * 100}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
