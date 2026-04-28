import { useState, useEffect } from "react";
import { Button, InputBox } from "../../../components/index.js";
import { loginSysUser } from "../../../services/auth/auth.js";
import {toast} from 'react-toastify'
import { useSelector , useDispatch} from "react-redux";
import { loginStart, loginSuccess } from "../../../store/authSlice.js";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const {user, authStatus, isLoading} = useSelector(state => state.auth)

    const [formData, setFormData] = useState({
        phone_number : "",
        password : ""
    });


    const handleSubmit =  async () => {
            // console.log(formData);

            try{
                dispatch(loginStart())
                const data = await loginSysUser({loginData : formData})
                console.log(data?.data?.user);
                toast.success(data?.message)
                dispatch(loginSuccess(data?.data?.user))
                    
                //adjust based on api calls and other thing, WILL USE :: loading
            } catch (message) {
               toast.error(message)
                
            }      
    }

    const handlePhnChange = (e) => setFormData({...formData, phone_number : e.target.value});
    const handlePwdChange = (e) => setFormData({...formData, password : e.target.value});

 
    return <div className="w-90 px-10 py-12 flex flex-col jusity-center items-center gap-4 
                border border-white rounded-xl shadow-lg">
                <p className="text-3xl font-bold text-green-600">LOGIN</p>
                <InputBox type="text" placeholder="Enter your phone number" onChange={handlePhnChange} />
                <InputBox type="password" placeholder="Enter your Password" onChange={handlePwdChange} />
                <Button size="lg" className="w-full" children="Login" loading={isLoading} onClick={handleSubmit} />
            </div>
}

export default LoginForm;
