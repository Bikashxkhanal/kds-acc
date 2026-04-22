import { useEffect } from "react";
import { Outlet } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import { verifyUser } from "./services/auth/auth.js";
import { useDispatch } from "react-redux";
import { verifyMeFail, verifyMeStart, verifyMeSuccess } from "./store/authSlice.js";


function App() {
       const dispatch = useDispatch();
       useEffect(() => {
              ;(async () => {
                 try {
                     
                     dispatch(verifyMeStart());
                     const data = await verifyUser();
                     // console.log(data?.data);
                     dispatch(verifyMeSuccess(data?.data)) 
                     // console.log("Pass");
                     
                     
                 } catch (error) {
                     // console.log("Failed");     
                     toast.error("Session expired please login!")
                     dispatch(verifyMeFail())
                     
                 }    
              })()
}, []);

       return(<>
       <Outlet />
       <ToastContainer />
       </>
       
       )
}

export default App
