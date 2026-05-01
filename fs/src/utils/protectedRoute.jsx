import { useState , useEffect} from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";


const ProtectedRoute = ({
    children
}) => {

    const {user, authStatus, isLoading} = useSelector(state => state.auth);

     if(isLoading){
        return <h1>Loading...</h1>
    }
    
    if(!user || authStatus === 'unauthenticated'){
        console.log(user);
       return <Navigate to= '/login' replace />
        
    }

    return <Outlet />
    
}


export default ProtectedRoute;
