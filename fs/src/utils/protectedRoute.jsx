import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoute = () => {

    const {user, authStatus, isLoading} = useSelector(state => state.auth);

     if(isLoading){
        return <h1>Loading...</h1>
    }
    
    if(authStatus !== 'authenticated' || !user?.id){
       return <Navigate to= '/login' replace />
        
    }

    return <Outlet />
    
}


export default ProtectedRoute;
