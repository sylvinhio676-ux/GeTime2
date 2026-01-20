const VARIANTS = {
  primary: {
    base: "bg-primary text-primary-foreground",
    hover: "hover:bg-primary/90",
  },
  danger: {
    base: "bg-destructive text-primary-foreground",
    hover: "hover:bg-destructive/90",
  },
  secondary: {
    base: "bg-muted text-foreground",
    hover: "hover:bg-muted-foreground/20 hover:text-foreground",
  },
  outline: {
    base: "border border-foreground text-foreground",
    hover: "hover:bg-muted hover:text-foreground",
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
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
};

export default Button;
