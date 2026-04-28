import { useEffect, useState } from "react";


const ToggleButton = ({
    options = [], 
    className = '',
    activeButton
}) => {
    //must of of 2 length , no more or less
    if(options?.length !== 2)return;
    const highPriority = options?.[0] //for ui (0th element should be colored 0 and 1th should be red for better UI)
    const [selected, setSelected] = useState(options?.[0]);

    const toggleButtonBaseStyle = ` text-gray-400 py-[1px]  px-[8px] rounded-2xl cursor-pointer`

    useEffect(() => {
        activeButton(selected)
    }, [selected] )

    return (
        <div className={`px-4 py-1.5 flex flex-row gap-4 bg-white text-gray-400 border border-gray-300 rounded-4xl  ${className}`} >
            {
                options.map((option) => (
                    <button className={ ` ${toggleButtonBaseStyle} ${(option === selected ) ? (option === highPriority) ? 'bg-green-300 text-white' : 'bg-red-300 text-white' : '' }  `} onClick={() => setSelected(() => option)
                    } key={option}  >
                            {option}
                    </button>
                ))
            }
        </div>
    )

}

export default ToggleButton;