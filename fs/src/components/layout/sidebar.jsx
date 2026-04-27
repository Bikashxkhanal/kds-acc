import {NavLink, Link} from 'react-router-dom'
import { SIDEBAR_NAVIGATION , ICONS, LINKS} from "../../constants.js";
const SideBar = () => {
    const sidebarList =  SIDEBAR_NAVIGATION;
    
    
        return <aside className="w-0 md:w-1/5 h-full bg-purple-600 flex flex-col items-center pt-3">
                    {
                       sidebarList?.map((sidebar, idx) => <NavLink 
                       key={idx}
                        to={LINKS[sidebar]}
                       className={({isActive}) => (`w-[97%] bg-purple-600 text-white py-4 pl-16 text-center text-xl flex flex-row flex-start gap-5 cursor-pointer ${isActive ? " bg-purple-800 border border-purple-800 rounded-sm" : ""}`)}>
                        {<i className={`${ICONS[sidebar]} `} />}
                        {sidebar.charAt(0).toUpperCase() + sidebar.slice(1)}</NavLink>)
                    }
                    
                </aside>
}

export default SideBar;