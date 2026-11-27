type ButtonSpinnerProps = {
  tone?: "on-brand" | "brand";
};

export function ButtonSpinner({ tone = "on-brand" }: ButtonSpinnerProps) {
  const borderClass =
    tone === "brand"
      ? "border-rsvd-brand border-t-transparent"
      : "border-rsvd-on-brand border-t-transparent";

  return (
    <span
      aria-hidden="true"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 ${borderClass}`}
    />
  );
}
