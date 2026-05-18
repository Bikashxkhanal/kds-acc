import { useEffect, useState } from "react"
import { useSelector , useDispatch} from "react-redux";
import { getCurrentTime } from "../../../helpers/date";
import { logoutSysUser } from "../../../services/auth/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { clearAuthState } from "../../../store/authSlice.js";
import HangingSideBar from "../../../components/layout/hanging.sidebar.jsx";

const DashboardHeader = ({
    isSideBarRequired = false
}) => {
    const stat = window.innerWidth <= 768 ? true : false;
    const [isActiveBrgIcn, setIsActiveBrgIcn] = useState(stat);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState((new Date()).toLocaleString())
    const {user} = useSelector(state => state?.auth);

    //passing data to parent
    useEffect(() => 
        {
            isSideBarRequired(!isActiveBrgIcn)
        }, [isActiveBrgIcn])

    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    useEffect(() => {
        const handleResize = () => {
            if(innerWidth <= 768){
            setIsActiveBrgIcn(true)
        }else{
            setIsActiveBrgIcn(false)
        }

        window.addEventListener('resize', handleResize)

        return () => window.removeEventListener('resize', handleResize)
        }
    }, [])
    
    useEffect(() => {
      const interval =  setInterval(() => {
       const  curTime = getCurrentTime();
        setCurrentTime(curTime);
       
    }, 1000);

    return () => clearInterval(interval)

    }, [])
    
    


const handleLogout = async () => {
  try {
    await logoutSysUser();

    dispatch(clearAuthState());
    
    
    navigate("/login", {replace : true});
  } catch (error) {
    dispatch(clearAuthState());
   

    if (error?.status === 401) {
        
        
      navigate("/login", {replace : true});
      return;
    }

    toast.error(error?.data?.message || "Logout failed");
  }
};

    return <header className="w-full bg-purple-700 font-bold flex flex-start gap-45 md:flex-row  md:justify-between items-center px-12 py-4" >
            {/* logo or name or both on the left side */}
            <h1 className="text-4xl text-white text-bold">KDS</h1>
            {
                (isActiveBrgIcn && !isOpen )&& (
                    <div>
                    <button className="cursor-pointer flex flex-col gap-1" onClick={() => setIsOpen(prev => !prev)} >
                        <div className="w-5 h-0 border border-white rounded-lg"></div>
                        <div className="w-5 h-0 border border-white rounded-lg"></div>
                        <div className="w-5 h-0 border border-white rounded-lg"></div>
                    </button>
                    </div>
                )
            }
            {
                isOpen && (
                    <button className="cursor-pointer text-white text-xl " onClick={() => setIsOpen(prev => !prev)}>
                        X
                    </button>
                )
            }

            {
                isOpen && (
                    <div className="w-full" >
                    <HangingSideBar show={true} />
                    </div>
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
                    <i class="bi bi-box-arrow-right text-white text-2xl" onClick={handleLogout} />
                    <span className="text-white text-[14px]">Welcome {user?.name?.split(" ")?.[0] || "Guest"}</span>
                </button>
            )}
             </div>
            </header>
}

export default DashboardHeader;