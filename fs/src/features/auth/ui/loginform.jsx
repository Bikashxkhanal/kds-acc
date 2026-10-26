import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, InputBox } from "../../../components/index.js";
import { loginSysUser } from "../../../services/auth/auth.js";
import { toast } from 'react-toastify'
import { useSelector , useDispatch} from "react-redux";
import { loginFail, loginStart, loginSuccess } from "../../../store/authSlice.js";
import { useI18n } from "../../../i18n/I18nProvider.jsx";

const LoginForm = () => {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.auth)
    const { t } = useI18n();

    const [formData, setFormData] = useState({
        phone_number: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (searchParams.get('session') === 'expired') toast.info('Your session expired. Please log in again.');
    }, [searchParams]);

    const handleSubmit = async () => {
        try {
            dispatch(loginStart())
            const data = await loginSysUser({ loginData: formData })
            toast.success(data?.message)
            dispatch(loginSuccess(data?.data?.user))
        } catch (message) {
            dispatch(loginFail())
            toast.error(message)
        }
    }

    return (
        <div className="w-full max-w-md px-8 py-10 flex flex-col gap-5 kds-card shadow-lg">
            <div className="text-center">
                <div className="w-14 h-14 mx-auto bg-[#12355b]/10 rounded-xl flex items-center justify-center mb-3">
                    <i className="bi bi-shield-lock text-2xl text-[#12355b]" />
                </div>
                <p className="text-2xl font-bold text-[#12355b]">{t('auth.welcome')}</p>
                <p className="text-sm text-slate-500 mt-1">{t('auth.signInPrompt')}</p>
            </div>
            <InputBox
                type="text"
                label={t('auth.phone')}
                placeholder={t('auth.phonePlaceholder')}
                icon="bi-telephone"
                required
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            <InputBox
                type={showPassword ? "text" : "password"}
                label={t('auth.password')}
                placeholder="Enter your password"
                icon="bi-lock"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                rightAdornment={<button type="button" className="rounded p-1 text-slate-500 hover:text-[#12355b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500" aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}><i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} aria-hidden="true" /></button>}
            />
            <Button size="lg" className="w-full mt-2" children={t('auth.signIn')} loading={isLoading} onClick={handleSubmit} />
        </div>
    );
}

export default LoginForm;
