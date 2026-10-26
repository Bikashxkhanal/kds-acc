import { useEffect } from "react";
import { Outlet } from "react-router-dom"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css";
import { verifyUser } from "./services/auth/auth.js";
import { useDispatch } from "react-redux";
import { verifyMeFail, verifyMeStart, verifyMeSuccess } from "./store/authSlice.js";


function App() {
       const dispatch = useDispatch();
       useEffect(() => {
              ;(async () => {
                 if (window.location.pathname === '/__date-debug') return;
                 if (!localStorage.getItem('accessToken')) {
                     dispatch(verifyMeFail());
                     return;
                 }
                 try {
                     
                     dispatch(verifyMeStart());
                     const data = await verifyUser();
                     // console.log(data?.data);
                     dispatch(verifyMeSuccess(data?.data)) 
                     // console.log("Pass");
                     
                     
                 } catch {
                     // console.log("Failed");     
                     dispatch(verifyMeFail())
                     
                 }    
              })()
	}, [dispatch]);

       return(<>
       <Outlet />
       <ToastContainer />
       </>
       
       )
}

export default App
