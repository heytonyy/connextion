import { formatDate, getLocalDate } from "@/utils/utils";

// Today through a week out, in the player's local timezone
const DAYS_AHEAD = 7;

interface DatePickerProps {
  date: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ date, onChange }: DatePickerProps) {
  const dates = Array.from({ length: DAYS_AHEAD + 1 }, (_, i) =>
    getLocalDate(i)
  );

  return (
    <select
      aria-label="Puzzle date"
      className="cursor-pointer rounded bg-transparent font-extrabold text-blue-500 outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
      value={date}
      onChange={(e) => onChange(e.target.value)}
    >
      {dates.map((d) => (
        <option key={d} value={d}>
          {formatDate(d)}
        </option>
      ))}
    </select>
  );
}
