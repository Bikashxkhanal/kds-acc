import {NavLink} from 'react-router-dom'
import { SIDEBAR_NAVIGATION , ICONS, LINKS} from "../../constants.js";

const SideBar = () => {
    return (
        <aside className="hidden md:flex w-56 lg:w-64 h-full bg-[#12355b] flex-col py-4 shadow-lg">
            <div className="px-6 mb-6">
                <p className="text-xs uppercase tracking-wider text-sky-300/70 font-medium">Navigation</p>
            </div>
            <nav className="flex flex-col gap-1 px-3">
                {SIDEBAR_NAVIGATION?.map((sidebar, idx) => (
                    <NavLink
                        key={idx}
                        to={LINKS[sidebar]}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? "bg-white/15 text-white shadow-sm"
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

export default SideBar;
