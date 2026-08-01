import { SIDEBAR_NAVIGATION } from "../../constants"
import { NavLink } from "react-router-dom"
import { LINKS, ICONS } from "../../constants"

const HangingSideBar = ({ show = false, onClose }) => {
    return (
        <aside className={`bg-[#12355b] h-screen py-6 px-4 flex flex-col fixed top-0 left-0 z-50 w-64 shadow-2xl
                transition-transform duration-300 ease-in-out ${show ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex items-center justify-between mb-8 px-2">
                <h1 className="text-2xl font-bold text-white">KDS</h1>
                <button type="button" onClick={onClose} className="text-white/70 hover:text-white cursor-pointer">
                    <i className="bi bi-x-lg text-xl" />
                </button>
            </div>
            <nav className="flex flex-col gap-1">
                {SIDEBAR_NAVIGATION?.map((sidebar, idx) => (
                    <NavLink
                        key={idx}
                        to={LINKS[sidebar]}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-white/15 text-white"
                                    : "text-sky-100/80 hover:bg-white/10 hover:text-white"
                            }`
                        }
                    >
                        <i className={`${ICONS[sidebar]} text-lg`} />
                        {sidebar.charAt(0).toUpperCase() + sidebar.slice(1)}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default HangingSideBar;
