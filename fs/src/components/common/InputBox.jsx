import { useState, useEffect } from "react";


const InputBox = ({
    type='text',
    placeholder="Enter your Email",
    onChange,
    readOnly = false,
    className
    // manages input box based on use cases, w-full for login, w-1/2 on work form , 

}) => {
    const baseStyle = `outline-none bg-white w-full h-10 px-3 py-2 border border-white rounded-sm ${className}`;
    const [inputValue, setInputValue] = useState('');

    const handleChange = (e) => {
        onChange(e.target.value)
        setInputValue(e.target.value)
        
    }

    return <input 
            className={`${baseStyle}`}
            type={type}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleChange}
            readOnly={readOnly}
        />
}

export default InputBox;