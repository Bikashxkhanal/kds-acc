import { useState, useEffect, forwardRef } from "react";


const InputBox = forwardRef(({
    type='text',
    placeholder="Enter your Email",
    onChange,
    value,
    readOnly = false,
    className, 
    ...rest
    // manages input box based on use cases, w-full for login, w-1/2 on work form , 

}, ref) => {
    const baseStyle = `outline-none bg-white w-full h-10 px-3 py-2 border border-white rounded-sm ${className}`;
   

    return <input 
            ref={ref}
            className={`${baseStyle}`}
            type={type}
            placeholder={placeholder}
            {...(value !== undefined) ? {value} : {}}
            {...(onChange ? {onChange} : {})}
            readOnly={readOnly}
            {...rest}
        />
})

export default InputBox;