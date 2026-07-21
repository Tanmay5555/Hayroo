



export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  icon: Icon,
  ...props
}) {
  // Base styling for consistency
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-4';

  // Variant styling
  const variants = {
    primary: 'bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800',
    outline: 'border border-gray-200 bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:ring-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700',
    iconOnly: 'rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white',
  };

  // Size styling
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const selectedSize = variant === 'iconOnly' ? '' : sizes[size];

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${selectedSize} ${className}`}
      {...props}
    >
      {Icon && <Icon className={`${children ? '-ms-1 me-2' : ''} h-5 w-5`} />}
      {children}
    </button>
  );
}