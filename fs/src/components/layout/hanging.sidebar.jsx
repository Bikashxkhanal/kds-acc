import { SIDEBAR_NAVIGATION } from "../../constants"
import { NavLink } from "react-router-dom"
import { LINKS, ICONS } from "../../constants"
const HangingSideBar = ({show = false}) => {
    return (
            <aside className={`bg-purple-400 h-screen py-2 px-4 border border-purple-400 
                    rounded-r-sm text-sm flex flex-col items-center fixed top-0 left-0 z-10 shadow-3xl
                    transition-all delay-500 duration-1000 ease-in-out ${show ? 'opacity-120 translate-x-0' : 'opacity-0 -translate-x-30'} `}>
                    <h1 className="text-4xl text-white text-bold mb-7">KDS</h1>
                    {
                       SIDEBAR_NAVIGATION?.map((sidebar, idx) => <NavLink 
                       key={idx}
                        to={LINKS[sidebar]}
                       className={({isActive}) => (`w-[97%] px-7 mr-3 py-2 text-black text-center text-xl flex flex-row flex-start gap-2 ${isActive ? " bg-purple-800 border border-purple-800 rounded-sm" : ""}`)}>
                        {<i className={`${ICONS[sidebar]} `} />}
                        {sidebar.charAt(0).toUpperCase() + sidebar.slice(1)}</NavLink>)
                    }
                    
                </aside>
    )
}

export default HangingSideBar