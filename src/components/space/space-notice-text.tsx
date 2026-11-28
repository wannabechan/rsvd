type SpaceNoticeTextProps = {
  text: string;
  className?: string;
};

/** Renders notice text; blank lines use 75% of one line-height. */
export function SpaceNoticeText({ text, className }: SpaceNoticeTextProps) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");

  return (
    <div className={className}>
      {lines.map((line, index) =>
        line === "" ? (
          <span
            key={`blank-${index}`}
            className="block h-[0.75lh]"
            aria-hidden
          />
        ) : (
          <span key={`line-${index}`} className="block whitespace-pre-wrap">
            {line}
          </span>
        ),
      )}
    </div>
  );
}
