import GateMotif from "./GateMotif";

export default function Logo({ tone = "dark", size = "md", iconOnly = false }) {
  const textColor = tone === "light" ? "text-cream" : "text-accent";
  const markColor = tone === "light" ? "#EFE6D8" : "#1E3932";
  const textSize = size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg";
  const markSize = size === "lg" ? "w-8 h-8" : size === "sm" ? "w-5 h-5" : "w-6 h-6";

  return (
    <div className="inline-flex items-center gap-2.5">
      <GateMotif variant="mark" stroke={markColor} className={markSize} />
      {!iconOnly && (
        <span className={`font-display ${textSize} ${textColor} tracking-tight`}>
          Civiora
        </span>
      )}
    </div>
  );
}
