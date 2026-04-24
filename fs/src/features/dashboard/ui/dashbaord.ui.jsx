import { useSelector } from "react-redux";
import DashboardHeader from "./dashboardHeader";
import { Container, Footer } from "../../../components";
import SideBar from "./sidebar";
import { useState } from "react";
import MainContent from "../../dashboradUI/mainContent";

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
            <MainContent />
        </Container>
        <Footer />
        </>
}

export default Dashboard;