import { useState } from "react";
import { Button, InputBox } from "../../../components/index.js";
import { loginSysUser } from "../../../services/auth/auth.js";
import { toast } from 'react-toastify'
import { useSelector , useDispatch} from "react-redux";
import { loginFail, loginStart, loginSuccess } from "../../../store/authSlice.js";

const LoginForm = () => {
    const dispatch = useDispatch();
    const { isLoading } = useSelector(state => state.auth)

    const [formData, setFormData] = useState({
        phone_number: "",
        password: ""
    });

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
                <p className="text-2xl font-bold text-[#12355b]">Welcome Back</p>
                <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
            </div>
            <InputBox
                type="text"
                label="Phone Number"
                placeholder="Enter your phone number"
                icon="bi-telephone"
                required
                onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
            />
            <InputBox
                type="password"
                label="Password"
                placeholder="Enter your password"
                icon="bi-lock"
                required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <Button size="lg" className="w-full mt-2" children="Sign In" loading={isLoading} onClick={handleSubmit} />
        </div>
    );
}

export default LoginForm;
