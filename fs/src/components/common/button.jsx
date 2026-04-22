import { useState } from "react";


const Button = ({
        children = "Click", //text to show
        varient,  // primary, secondary, danger
        size,
        onClick, //callback fn passed for what to do on click
        disabled = false,
        loading = false


}) => {
    //dynamic button (danger act(eg. delete, color - red), soft UI(eg. cancel, color - white/orange), colored UI(eg. create, update (green color)))

    const [isDisabled, setIsDisabled] = useState(loading || disabled);


    const varients = {
        primary : 'border-green-600 rounded-sm bg-green-600 text-white hover:bg-green-700 hover:border-green-700 focus:ring-1 focus:ring-offset-1 disabled:bg-green-300  disabled:border-green-300 disabled:cursor-not-allowed', 
        secondary : 'border-white rounded-sm bg-white text-black hover:bg-gray-200 hover:border-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:border-gray-300', 
        danger : 'border-red-600 rounded-sm bg-red-600 text-white hover:bg-red-700 hover:border-red-700 disabled:bg-red-300 disabled:cursor-not-allowed disabled:border-red-300'
    };

    const sizes = {
        sm : 'px-6 py-2', 
        md : 'px-10 py-3', 
        lg : 'px-14 py-3'
    }


    return  <button
              className={`
                border cursor-pointer transition-all duration-200 focus:outline-none text-center
                ${size ? sizes[size] : "px-8 py-2" }
                ${varient ? varients[varient] : varients['primary']}
                `
                } 
                onClick={onClick} 
                disabled={isDisabled}
                
                >
                  {loading && (
                        <svg className="size-5 border-3 border-white border-t-transparent rounded-full px-auto animate-spin" viewBox="0 0 24 24">
                        </svg>
                        
                  )}
                  <span>
                        { loading ? "" : children}
                  </span>

                
               
            </button>

}

export default Button;