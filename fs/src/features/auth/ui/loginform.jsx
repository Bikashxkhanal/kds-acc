import { useState, useEffect } from "react";
import { Button, InputBox } from "../../../components/index.js";

const LoginForm = () => {
    
    const [isDisabled, setIsDisabled] = useState(false);
    const [formData, setFormData] = useState({
        phone_number : "",
        password : ""
    });

    const handleSubmit = () => {
            setIsDisabled(true);
            console.log(formData);

            //adjust based on api calls and other thing, WILL USE :: loading
            setTimeout(() => {
                setIsDisabled(false)
            }, 2000);
               
            
    }

    const handlePhnChange = (value) => setFormData({...formData, phone_number : value});
    const handlePwdChange = (value) => setFormData({...formData, password : value});
 

    return <div className="w-90 px-10 py-12 flex flex-col jusity-center items-center gap-4 border border-white rounded-xl shadow-lg">
                <p className="text-3xl font-bold text-green-600">LOGIN</p>
                <InputBox type="text" placeholder="Enter your phone number" onChange={handlePhnChange} />
                <InputBox type="password" placeholder="Enter your Password" onChange={handlePwdChange} />
                <Button size="lg" className="w-full" children="Login" disabled={isDisabled} onClick={handleSubmit} />
            </div>
}

export default LoginForm;