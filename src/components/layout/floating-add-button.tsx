export function FloatingAddButton() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[480px]">
      <div className="pointer-events-auto flex justify-end p-4 pb-6">
        <button
          type="button"
          aria-label="추가"
          className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rsvd-border text-rsvd-text-muted shadow-sm transition hover:bg-rsvd-tint"
        >
          <PlusIcon />
        </button>
      </div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-7 w-7"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
