const VARIANTS = {
  primary: "bg-gold text-forest-dark hover:bg-gold-dark focus-visible:outline-forest shadow-sm",
  forest: "bg-forest text-cream hover:bg-forest-light",
  ghost: "bg-transparent text-accent hover:bg-accent/8 ring-1 ring-accent/15",
  danger: "bg-[#A6452F] text-cream hover:bg-[#8c3a27]",
  subtle: "bg-brown/5 text-brown hover:bg-brown/10",
};

const SIZES = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  as: Component = "button",
  ...props
}) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-[12px] font-medium tracking-wide transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
