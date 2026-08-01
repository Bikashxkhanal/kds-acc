import DashboardHeader from "../../features/dashboard/ui/dashboardHeader";
import { Container, Footer } from "..";
import SideBar from "./sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => (
  <>
    <DashboardHeader />
    <Container>
      <SideBar />
      <div className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </div>
    </Container>
    <Footer />
  </>
);

export default Dashboard;
