const Button = ({
    children = "Click",
    varient,
    size,
    onClick,
    disabled = false,
    loading = false,
    className = '',
    type = "button"
}) => {
    const varients = {
        primary: 'bg-[#12355b] text-white border-[#12355b] hover:bg-[#1a4a7a] hover:border-[#1a4a7a] focus:ring-[#12355b]/30 disabled:bg-slate-300 disabled:border-slate-300',
        secondary: 'bg-white text-[#12355b] border-slate-300 hover:bg-slate-50 hover:border-slate-400 disabled:bg-slate-100',
        danger: 'bg-red-600 text-white border-red-600 hover:bg-red-700 hover:border-red-700 disabled:bg-red-300',
        success: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 hover:border-emerald-700 disabled:bg-emerald-300',
        confirmation: 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200 disabled:bg-slate-100',
        outline: 'bg-transparent text-[#12355b] border-[#12355b] hover:bg-[#12355b]/5 disabled:opacity-50'
    };

    const sizes = {
        sm: 'py-1.5 px-4 text-sm',
        md: 'px-6 py-2.5 text-sm',
        lg: 'px-8 py-3 text-base'
    };

    return (
        <button
            type={type}
            className={`
                inline-flex items-center justify-center gap-2 border rounded-lg cursor-pointer
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1
                disabled:cursor-not-allowed font-medium
                ${className}
                ${size ? sizes[size] : sizes.md}
                ${varient ? varients[varient] : varients.primary}
            `}
            onClick={onClick}
            disabled={loading || disabled}
        >
            {loading && (
                <svg className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin" viewBox="0 0 24 24" />
            )}
            {!loading && children}
        </button>
    );
};

export default Button;
