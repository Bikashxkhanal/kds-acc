import {NavLink, Link} from 'react-router-dom'
import { SIDEBAR_NAVIGATION , ICONS} from "../../../constants.js";
const SideBar = () => {
    const sidebarList =  SIDEBAR_NAVIGATION;
    const icons = ICONS;
    
        return <aside className="w-0 md:w-1/5 h-full bg-purple-600 flex flex-col items-center">
                    {
                       sidebarList?.map((sidebar) => <NavLink 
                       className="w-[98%] bg-purple-600 text-white py-4 pl-16 text-center text-xl flex flex-row flex-start gap-5 cursor-pointer">
                        {<i className={`${ICONS[sidebar]} `} />}
                        {sidebar.charAt(0).toUpperCase() + sidebar.slice(1)}</NavLink>)
                    }
                    
                </aside>
}

export default SideBar;