export default function Card({ children, className = "", as: Component = "div", ...props }) {
  return (
    <Component
      className={`bg-surface rounded-[18px] ring-1 ring-brown/8 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
