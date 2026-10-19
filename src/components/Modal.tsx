import { useEffect } from "react";

interface ModalProps {
  title: string;
  children: React.ReactNode;
  // Omit to make the modal impossible to dismiss (e.g. game over)
  onClose?: () => void;
}

export default function Modal({ title, children, onClose }: ModalProps) {
  // Escape closes dismissible modals
  useEffect(() => {
    if (!onClose) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="relative w-full max-w-sm bg-white p-6 text-center shadow-[6px_6px_0px_black]"
        onClick={(e) => e.stopPropagation()}
      >
        {onClose && (
          <button
            aria-label="Close"
            className="absolute right-3 top-2 text-2xl leading-none text-gray-500 hover:text-black"
            onClick={onClose}
          >
            ×
          </button>
        )}
        <h2 id="modal-title" className="mb-4 text-2xl font-extrabold text-blue-500">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}
