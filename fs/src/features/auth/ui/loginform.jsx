import { useState, useEffect } from "react";
import { Button, InputBox } from "../../../components/index.js";
import { loginSysUser } from "../../../services/auth/auth.js";
import {toast} from 'react-toastify'

const LoginForm = () => {
    
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone_number : "",
        password : ""
    });

    const handleSubmit =  async () => {
            setIsLoading(true);
            console.log(formData);

            try {
            const data = await loginSysUser({loginData : formData})
            console.log(data);
            toast.success(data?.message)
    
                //adjust based on api calls and other thing, WILL USE :: loading
            } catch (message) {
               toast.error(message)
                
            }  finally{
                 setIsLoading(false) 
            }
            
    }

    const handlePhnChange = (value) => setFormData({...formData, phone_number : value});
    const handlePwdChange = (value) => setFormData({...formData, password : value});
 
    return <div className="w-90 px-10 py-12 flex flex-col jusity-center items-center gap-4 
                border border-white rounded-xl shadow-lg">
                <p className="text-3xl font-bold text-green-600">LOGIN</p>
                <InputBox type="text" placeholder="Enter your phone number" onChange={handlePhnChange} />
                <InputBox type="password" placeholder="Enter your Password" onChange={handlePwdChange} />
                <Button size="lg" className="w-full" children="Login" loading={isLoading} onClick={handleSubmit} />
            </div>
}

export default LoginForm;
