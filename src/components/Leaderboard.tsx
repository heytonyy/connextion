import { useState } from "react";
import { formatDate } from "@/utils/utils";
import LeaderboardTable from "./LeaderboardTable";
import Modal from "./Modal";

export default function Leaderboard({ date }: { date: string }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        className="rounded bg-pink-500 px-4 py-2 text-sm font-bold uppercase text-white shadow transition-all hover:shadow-lg active:bg-pink-600"
        type="button"
        onClick={() => setShowModal(true)}
      >
        Leaderboard
      </button>
      {showModal && (
        <Modal title={formatDate(date)} onClose={() => setShowModal(false)}>
          <LeaderboardTable date={date} />
        </Modal>
      )}
    </>
  );
}
