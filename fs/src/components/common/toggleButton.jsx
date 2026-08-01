import { useEffect, useState } from "react";

const ToggleButton = ({ options = [], className = '', activeButton }) => {
    const [selected, setSelected] = useState(options?.[0]?.trim());

    useEffect(() => {
        activeButton?.(selected);
    }, [activeButton, selected]);

    if (options?.length !== 2) return null;

    return (
        <div className={`inline-flex p-1 bg-slate-100 rounded-lg border border-slate-200 ${className}`}>
            {options.map((option) => (
                <button
                    type="button"
                    key={option}
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer ${
                        option === selected
                            ? "bg-[#12355b] text-white shadow-sm"
                            : "text-slate-600 hover:text-[#12355b]"
                    }`}
                    onClick={() => setSelected(option)}
                >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
            ))}
        </div>
    );
};

export default ToggleButton;
