import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { clearMessage } from "@/state/reducers";
import {
  DeselectButton,
  ShuffleButton,
  SubmitButton,
} from "@/components/index";

export default function MenuButtons() {
  const mistakesRemaining = useAppSelector(
    (state) => state.mistakesRemaining
  );
  const message = useAppSelector((state) => state.message);
  const dispatch = useAppDispatch();

  // Feedback like "One away..." fades after a couple of seconds
  useEffect(() => {
    if (!message) return;
    const timeoutId = setTimeout(() => dispatch(clearMessage()), 2000);
    return () => clearTimeout(timeoutId);
  }, [message, dispatch]);

  return (
    <>
      <div className="h-6 text-center font-medium" role="status">
        {message}
      </div>
      <div className="my-2 flex items-center justify-center gap-4">
        Mistakes Remaining:
        <div className="flex h-[10px] items-center justify-center gap-2">
          {Array(mistakesRemaining)
            .fill(null)
            .map((_, index) => (
              <svg
                key={index}
                height="10"
                width="10"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle r="5" cx="5" cy="5" fill="grey" />
              </svg>
            ))}
        </div>
      </div>
      <div className="my-2 flex items-center justify-center gap-2 sm:gap-4">
        <ShuffleButton />
        <DeselectButton />
        <SubmitButton />
      </div>
    </>
  );
}
