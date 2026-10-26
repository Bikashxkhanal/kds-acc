import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";


const ProtectedRoute = () => {

    const {user, authStatus, isLoading} = useSelector(state => state.auth);
    const location = useLocation();

     if(isLoading){
        return <h1>Loading...</h1>
    }
    
    if(authStatus !== 'authenticated' || !user?.id){
       return <Navigate to= '/login' replace />
        
    }

    if (user.forcePasswordChange && location.pathname !== '/change-password') return <Navigate to="/change-password" replace />;
    return <Outlet />
    
}


export default ProtectedRoute;
