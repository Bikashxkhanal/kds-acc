import { useEffect, useState } from "react"
import { useSelector } from "react-redux";
import { getCurrentTime } from "../../../helpers/date";

const DashboardHeader = ({
    isSideBarRequired
}) => {
    const stat = window.innerWidth <= 768 ? true : false;
    const [isActiveBrgIcn, setIsActiveBrgIcn] = useState(stat);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState((new Date()).toLocaleString())
    const {user} = useSelector(state => state?.auth);

    //passing data to parent
    useEffect(() => {isSideBarRequired(!isActiveBrgIcn)}, [isActiveBrgIcn])
    
    
    window.addEventListener('resize', () => {
        if(innerWidth <= 768){
            setIsActiveBrgIcn(true)
        }else{
            setIsActiveBrgIcn(false)
        }
    })
    
    setInterval(() => {
       const  curTime = getCurrentTime();
        setCurrentTime(curTime);
       
    }, 1000);

    return <header className="w-dvw bg-purple-700 font-bold flex flex-row justify-between items-center px-12 py-4" >
            {/* logo or name or both on the left side */}
            <h1 className="text-4xl text-white text-bold">KDS</h1>
            {
                (isActiveBrgIcn && !isOpen )&& (
                    <button className="cursor-pointer flex flex-col gap-1" onClick={() => setIsOpen(prev => !prev)} >
                        <div className="w-5 h-0 border border-white rounded-lg"></div>
                        <div className="w-5 h-0 border border-white rounded-lg"></div>
                        <div className="w-5 h-0 border border-white rounded-lg"></div>
                    </button>
                )
            }
            {
                isOpen && (
                    <button className="cursor-pointer text-white text-xl" onClick={() => setIsOpen(prev => !prev)}>
                        X
                    </button>
                )
            }

            <div className="flex flex-row gap-6 items-center">
            {
                !isActiveBrgIcn && (
                    <p className="text-white w-30 text-[13px]">{currentTime} </p>
                )
            }

            {!isActiveBrgIcn && (
                <button className="w-20 flex flex-row gap-2 justify-center items-center cursor-pointer">
                    <i class="bi bi-box-arrow-right text-white text-2xl"  />
                    <span className="text-white text-[14px]">Welcome {user?.name.split(" ")?.[0] || "Guest"}</span>
                </button>
            )}
             </div>
            </header>
}

export default DashboardHeader;