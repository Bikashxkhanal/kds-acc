import { forwardRef } from "react";

const InputBox = forwardRef(({
    type = 'text',
    placeholder = "Enter value",
    onChange,
    value,
    readOnly = false,
    className = '',
    label,
    required = false,
    icon,
    error,
    rightAdornment,
    ...rest
}, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="kds-label">
                    {label}
                    {required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
            )}
            <div className="relative">
                {icon && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                        <i className={`bi ${icon}`} />
                    </span>
                )}
                <input
                    ref={ref}
                    className={`kds-input ${icon ? 'pl-9' : ''} ${rightAdornment ? 'pr-11' : ''} ${readOnly ? 'bg-slate-50' : ''} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : ''} ${className}`}
                    type={type}
                    placeholder={placeholder}
                    {...(value !== undefined ? { value } : {})}
                    {...(onChange ? { onChange } : {})}
                    readOnly={readOnly}
                    {...rest}
                />
                {rightAdornment && <span className="absolute right-2 top-1/2 -translate-y-1/2">{rightAdornment}</span>}
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
});

export default InputBox;
