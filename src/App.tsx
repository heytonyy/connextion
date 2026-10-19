import GithubCornerModule from "react-github-corner";
import { Grid, Timer } from "@/components/index";
import { useAppSelector } from "@/state/hooks";
import { formatDate } from "@/utils/utils";

// react-github-corner is CommonJS; Vite's production bundle hands back the module object
const GithubCorner =
  (GithubCornerModule as unknown as { default?: typeof GithubCornerModule })
    .default ?? GithubCornerModule;

export default function App() {
  const date = useAppSelector((state) => state.date);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <div className="my-4 flex gap-4 text-2xl font-extrabold text-blue-500 sm:text-4xl">
        ConNEXTions{" "}
        <span className="flex items-center text-2xl sm:text-4xl">
          {date && formatDate(date)}
        </span>
      </div>
      <div>
        <p className="my-2 text-center sm:text-lg">
          Create four groups of four!
        </p>
      </div>
      <Grid />
      <GithubCorner href="https://github.com/heytonyy/connextion" />
      <div className="flex items-center justify-center gap-4">
        <Timer />
      </div>
    </div>
  );
}
