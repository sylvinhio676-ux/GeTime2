const VARIANTS = {
  primary: {
    base: "bg-[#1E3A8A] text-white",
    hover: "hover:bg-[#2B4AA0]",
  },
  danger: {
    base: "bg-[#B4232B] text-white",
    hover: "hover:bg-[#8F1F2D]",
  },
  secondary: {
    base: "bg-[#CBD5E1] text-[#1F2A44]",
    hover: "hover:bg-[#94A3B8] hover:text-white",
  },
  outline: {
    base: "border border-[#1F2A44] text-[#1F2A44]",
    hover: "hover:bg-[#1F2A44] hover:text-white",
  },
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  type = "button",
  className = "",
  ...props
}) => {
  const styles = VARIANTS[variant] || VARIANTS.primary;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`
        px-4 py-2 rounded-md font-medium transition
        flex items-center justify-center gap-2
        ${styles.base}
        ${styles.hover}
        ${disabled || loading ? "opacity-60 cursor-not-allowed" : ""}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
