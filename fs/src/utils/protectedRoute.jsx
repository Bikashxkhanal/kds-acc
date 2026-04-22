import { useState , useEffect} from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";


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


    if(user && authStatus == 'authenticated'){
        return <> {children} </>
    }
    
}


export default ProtectedRoute;
