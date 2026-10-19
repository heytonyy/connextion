import { useAppSelector } from "@/state/hooks";
import {
  DeselectButton,
  ShuffleButton,
  SubmitButton,
} from "@/components/index";

export default function MenuButtons() {
  const mistakesRemaining = useAppSelector(
    (state) => state.mistakesRemaining
  );

  return (
    <>
      <div className="my-2 flex items-center justify-center gap-4">
        Mistakes Remaining:
        <div className="flex items-center justify-center gap-2">
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
