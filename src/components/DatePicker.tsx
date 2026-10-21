import { useEffect, useRef, useState } from "react";
import {
  addDays,
  FIRST_PUZZLE_DATE,
  formatDate,
  getLocalDate,
  MAX_DAYS_AHEAD,
  parseDate,
  toDateString,
} from "@/utils/utils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = Array.from({ length: 12 }, (_, i) =>
  new Date(2000, i, 1).toLocaleString("en-US", { month: "long" })
);

type MonthView = { year: number; month: number }; // month is 0-11

const monthOf = (dateString: string): MonthView => {
  const date = parseDate(dateString);
  return { year: date.getFullYear(), month: date.getMonth() };
};

// YYYY-MM-DD strings compare correctly as plain text
const clamp = (date: string, min: string, max: string) =>
  date < min ? min : date > max ? max : date;

// The 6 weeks shown for a month, starting on Monday
const calendarDays = ({ year, month }: MonthView) => {
  const first = new Date(year, month, 1);
  const mondayOffset = (first.getDay() + 6) % 7;
  const start = addDays(toDateString(first), -mondayOffset);
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
};

interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ date, onChange }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<MonthView>(() => monthOf(date));
  // The day keyboard focus sits on inside the grid
  const [focused, setFocused] = useState(date);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const today = getLocalDate(0);
  const maxDate = getLocalDate(MAX_DAYS_AHEAD);
  const minView = monthOf(FIRST_PUZZLE_DATE);
  const maxView = monthOf(maxDate);
  const viewIndex = view.year * 12 + view.month;
  const canGoBack = viewIndex > minView.year * 12 + minView.month;
  const canGoForward = viewIndex < maxView.year * 12 + maxView.month;

  const openPicker = () => {
    setView(monthOf(date));
    setFocused(date);
    setOpen(true);
  };

  const close = (returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  };

  const select = (day: string) => {
    if (day < FIRST_PUZZLE_DATE || day > maxDate) return;
    onChange(day);
    close(true);
  };

  const showMonth = (next: MonthView) => {
    // normalise month overflow from the arrows (e.g. month 12 -> next January)
    const normalised = new Date(next.year, next.month, 1);
    setView({ year: normalised.getFullYear(), month: normalised.getMonth() });
  };

  const moveFocus = (day: string) => {
    const next = clamp(day, FIRST_PUZZLE_DATE, maxDate);
    setFocused(next);
    setView(monthOf(next));
  };

  // Close on a click outside or Escape
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Move real focus along with the keyboard focus (and onto the selected day when opened)
  useEffect(() => {
    if (!open) return;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`)
      ?.focus();
  }, [open, focused]);

  const onGridKeyDown = (e: React.KeyboardEvent) => {
    const weekday = (parseDate(focused).getDay() + 6) % 7;
    const moves: Record<string, () => string> = {
      ArrowLeft: () => addDays(focused, -1),
      ArrowRight: () => addDays(focused, 1),
      ArrowUp: () => addDays(focused, -7),
      ArrowDown: () => addDays(focused, 7),
      Home: () => addDays(focused, -weekday),
      End: () => addDays(focused, 6 - weekday),
      PageUp: () => {
        const d = parseDate(focused);
        d.setMonth(d.getMonth() - 1);
        return toDateString(d);
      },
      PageDown: () => {
        const d = parseDate(focused);
        d.setMonth(d.getMonth() + 1);
        return toDateString(d);
      },
    };
    if (moves[e.key]) {
      e.preventDefault();
      moveFocus(moves[e.key]());
    }
  };

  const days = calendarDays(view);
  // Only one day is in the tab order: the focused one if it's on screen, else the first usable day
  const tabbable = days.includes(focused)
    ? focused
    : days.find(
        (d) =>
          parseDate(d).getMonth() === view.month &&
          d >= FIRST_PUZZLE_DATE &&
          d <= maxDate
      );

  const years = Array.from(
    { length: maxView.year - minView.year + 1 },
    (_, i) => minView.year + i
  );

  const navButton =
    "flex h-8 w-8 items-center justify-center rounded text-xl text-gray-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-30";
  const headerSelect =
    "cursor-pointer rounded bg-transparent px-1 font-bold text-black hover:bg-blue-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500";

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="flex items-center gap-3 border-2 border-black bg-white px-3 py-2 text-base font-medium text-black shadow-[3px_3px_0px_black] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none sm:text-lg"
        onClick={() => (open ? close(false) : openPicker())}
      >
        {formatDate(date, true)}
        <svg
          aria-hidden="true"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-500"
        >
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Choose a puzzle date"
          className="absolute left-1/2 top-full z-40 mt-3 w-[300px] -translate-x-1/2 border-2 border-black bg-white p-3 text-base font-normal text-black shadow-[4px_4px_0px_black]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              className={navButton}
              disabled={!canGoBack}
              onClick={() => showMonth({ ...view, month: view.month - 1 })}
            >
              ‹
            </button>
            <div className="flex items-center">
              <select
                aria-label="Month"
                className={headerSelect}
                value={view.month}
                onChange={(e) =>
                  setView({ ...view, month: Number(e.target.value) })
                }
              >
                {MONTHS.map((name, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </select>
              <select
                aria-label="Year"
                className={headerSelect}
                value={view.year}
                onChange={(e) =>
                  setView({ ...view, year: Number(e.target.value) })
                }
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              aria-label="Next month"
              className={navButton}
              disabled={!canGoForward}
              onClick={() => showMonth({ ...view, month: view.month + 1 })}
            >
              ›
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500">
            {WEEKDAYS.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>

          <div
            ref={gridRef}
            className="grid grid-cols-7 gap-1"
            onKeyDown={onGridKeyDown}
          >
            {days.map((day) => {
              const inMonth = parseDate(day).getMonth() === view.month;
              const disabled = day < FIRST_PUZZLE_DATE || day > maxDate;
              const selected = day === date;
              const isToday = day === today;
              return (
                <button
                  key={day}
                  type="button"
                  data-date={day}
                  tabIndex={day === tabbable ? 0 : -1}
                  disabled={disabled}
                  aria-label={formatDate(day, true)}
                  aria-pressed={selected}
                  aria-current={isToday ? "date" : undefined}
                  className={`h-9 rounded text-sm tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-blue-500 ${
                    selected
                      ? "bg-blue-500 font-bold text-white"
                      : disabled
                      ? "cursor-not-allowed text-gray-200"
                      : inMonth
                      ? "text-gray-900 hover:bg-blue-50"
                      : "text-gray-400 hover:bg-blue-50"
                  } ${isToday && !selected ? "ring-2 ring-inset ring-blue-500" : ""}`}
                  onClick={() => select(day)}
                  onFocus={() => setFocused(day)}
                >
                  {parseDate(day).getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-center gap-2 border-t border-gray-200 pt-3 text-sm font-medium">
            <button
              type="button"
              className="rounded px-3 py-1 text-blue-600 hover:bg-blue-50"
              onClick={() => select(today)}
            >
              Today
            </button>
            <button
              type="button"
              className="rounded px-3 py-1 text-blue-600 hover:bg-blue-50"
              onClick={() => select(getLocalDate(1))}
            >
              Tomorrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
