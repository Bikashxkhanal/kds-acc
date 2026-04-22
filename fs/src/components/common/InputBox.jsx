import { useState, useEffect } from "react";


const InputBox = ({
    type='text',
    placeholder="Enter your Email",
    onChange


}) => {
    const baseStyle = `outline-none bg-white px-4 py-2 border border-white rounded-sm`;
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
        
        />
}

export default InputBox;