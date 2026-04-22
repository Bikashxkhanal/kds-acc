import { useState , useEffect} from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";


const ProtectedRoute = ({
    children
}) => {
    const navigate = useNavigate();
    const {user, authStatus, isLoading} = useSelector(state => state.auth);

    
    if(!user || authStatus === 'unauthenticated'){
        navigate('/login');
        return;
    }

    if(isLoading){
        return <h1>Loading...</h1>
    }

    if(user && authStatus == 'authenticated'){
        return <> {children} </>
    }


    
}


export default ProtectedRoute;
