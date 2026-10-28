import {NavLink} from 'react-router-dom'
import { SIDEBAR_NAVIGATION , ICONS, LINKS} from "../../constants.js";
import { useI18n } from "../../i18n/I18nProvider.jsx";
import { useSelector } from 'react-redux';

const SideBar = () => {
    const { t } = useI18n();
    const role = useSelector((state) => state.auth.user?.role);
    return (
        <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-56 lg:w-64 h-screen overflow-y-auto bg-[#12355b] flex-col py-4 shadow-lg">
            <div className="px-6 mb-6">
                <p className="text-xs uppercase tracking-wider text-sky-300/70 font-medium">{t('nav.navigation')}</p>
            </div>
            <nav className="flex flex-col gap-1 px-3">
                {SIDEBAR_NAVIGATION?.map((sidebar, idx) => (
                    (['activity', 'users'].includes(sidebar) && role !== 'admin') ? null :
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
                        {t(`nav.${sidebar === 'customer' ? 'customers' : sidebar === 'billings' ? 'billing' : sidebar === 'opening' ? 'opening' : sidebar}`)}
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default SideBar;
