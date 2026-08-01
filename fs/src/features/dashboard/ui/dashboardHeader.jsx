import { useEffect, useState } from "react"
import { useSelector , useDispatch} from "react-redux";
import { getCurrentTime } from "../../../helpers/date";
import { logoutSysUser } from "../../../services/auth/auth";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { clearAuthState } from "../../../store/authSlice.js";
import HangingSideBar from "../../../components/layout/hanging.sidebar.jsx";

const DashboardHeader = () => {
    const stat = window.innerWidth <= 768;
    const [isActiveBrgIcn, setIsActiveBrgIcn] = useState(stat);
    const [isOpen, setIsOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState((new Date()).toLocaleString())
    const { user } = useSelector(state => state?.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const handleResize = () => {
            setIsActiveBrgIcn(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [])

    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(getCurrentTime()), 1000);
        return () => clearInterval(interval);
    }, [])

    const handleLogout = async () => {
        try {
            await logoutSysUser();
            dispatch(clearAuthState());
            navigate("/login", { replace: true });
        } catch (error) {
            dispatch(clearAuthState());
            if (error?.status === 401) {
                navigate("/login", { replace: true });
                return;
            }
            toast.error(error?.data?.message || "Logout failed");
        }
    };

    return (
        <header className="w-full bg-[#12355b] shadow-md sticky top-0 z-40">
            <div className="flex items-center justify-between px-4 md:px-8 py-3">
                <div className="flex items-center gap-4">
                    {isActiveBrgIcn && (
                        <button
                            type="button"
                            className="text-white p-1 cursor-pointer"
                            onClick={() => setIsOpen(prev => !prev)}
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <i className="bi bi-x-lg text-xl" /> : (
                                <div className="flex flex-col gap-1.5">
                                    <div className="w-5 h-0.5 bg-white rounded" />
                                    <div className="w-5 h-0.5 bg-white rounded" />
                                    <div className="w-5 h-0.5 bg-white rounded" />
                                </div>
                            )}
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">KDS</h1>
                        <p className="text-xs text-sky-300/70 hidden sm:block">Business Management System</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 md:gap-6">
                    {!isActiveBrgIcn && (
                        <p className="text-sky-200/80 text-xs hidden lg:block">{currentTime}</p>
                    )}
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                            <i className="bi bi-person text-white text-sm" />
                        </div>
                        <span className="text-white text-sm hidden sm:block">
                            {user?.name?.split(" ")?.[0] || "Guest"}
                        </span>
                        <button
                            type="button"
                            className="text-sky-200 hover:text-white transition-colors cursor-pointer ml-1"
                            onClick={handleLogout}
                            title="Logout"
                        >
                            <i className="bi bi-box-arrow-right text-lg" />
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && <HangingSideBar show={isOpen} onClose={() => setIsOpen(false)} />}
        </header>
    );
};

export default DashboardHeader;
