import { useSelector } from "react-redux";
import DashboardHeader from "../../features/dashboard/ui/dashboardHeader";
import { Container, Footer } from "..";
import SideBar from "./sidebar";
import { useState } from "react";
import MainContent from "../../features/dashboradUI/mainContent";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
    const {user, authStatus, loadingStat} = useSelector(state => state.auth);
    const [isSideBarActive, setIsSideBarActive] = useState(false);
    
    if(loadingStat)return <div>Loading...</div>
    // console.log(isSideBarActive);
    

    return <>
        <DashboardHeader isSideBarRequired={(status) => setIsSideBarActive(status)
        } /> 
        <Container >
            {
                isSideBarActive && (
                    <SideBar />
                )
            }
            <Outlet />
        </Container>
        <Footer />
        </>
}

export default Dashboard;