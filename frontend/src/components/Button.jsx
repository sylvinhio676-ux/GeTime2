const VARIANTS = {
  primary: {
    base: "bg-[#0B1F4B] text-white",
    hover: "hover:bg-[#4FC3F7]",
  },
  danger: {
    base: "bg-[#D50032] text-white",
    hover: "hover:bg-[#0B1F4B]",
  },
  secondary: {
    base: "bg-[#B0B0B0] text-[#0B1F4B]",
    hover: "hover:bg-[#4FC3F7] hover:text-white",
  },
  outline: {
    base: "border border-[#0B1F4B] text-[#0B1F4B]",
    hover: "hover:bg-[#0B1F4B] hover:text-white",
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
