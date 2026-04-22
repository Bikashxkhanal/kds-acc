import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";


const PublicRoute = ({children}) => {
    const {user, authStatus, isLoading } = useSelector(state => state.auth);
    // console.log(user, authStatus);
    

         if(user.id && authStatus === 'authenticated'){
            console.log("Navigating back");
            console.log(user.id, authStatus);
            
            
            return <Navigate to='/' replace />
            
    }  

    if(isLoading) return <h1>Loading...</h1>

    return children;


}

export default PublicRoute;