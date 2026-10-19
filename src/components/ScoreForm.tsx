import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { markSubmitted } from "@/state/reducers";
import { submitCompletion } from "@/lib/leaderboard";

export default function ScoreForm() {
  const gameId = useAppSelector((state) => state.gameId);
  const guesses = useAppSelector((state) => state.guesses);
  const dispatch = useAppDispatch();

  const [initials, setInitials] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = /^[A-Za-z]{2,3}$/.test(initials);
  const validateMsg =
    initials.length > 0 && !valid ? "Initials must be 2-3 letters." : error;

  const formSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameId || !valid) return;
    setSubmitting(true);
    setError("");
    try {
      await submitCompletion(gameId, initials, guesses);
      dispatch(markSubmitted());
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={formSubmit} className="flex flex-col items-center gap-2">
      <label htmlFor="initials">Add your initials to the leaderboard</label>
      <div className="flex gap-2">
        <input
          id="initials"
          autoFocus
          autoComplete="off"
          className="w-24 border-2 border-black px-2 py-1 text-center font-bold uppercase"
          maxLength={3}
          placeholder="ABC"
          value={initials}
          onChange={(e) => setInitials(e.target.value)}
        />
        <button
          type="submit"
          disabled={!valid || submitting}
          className="bg-indigo-500 px-4 py-1 font-medium text-white shadow-[3px_3px_0px_black] transition-all enabled:hover:translate-x-[3px] enabled:hover:translate-y-[3px] enabled:hover:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="h-5 text-sm text-red-600">{validateMsg}</div>
    </form>
  );
}
