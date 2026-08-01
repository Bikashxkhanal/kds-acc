import DashboardHeader from "../../features/dashboard/ui/dashboardHeader";
import { Container, Footer } from "..";
import SideBar from "./sidebar";
import { Outlet } from "react-router-dom";

const Dashboard = () => (
  <>
    <DashboardHeader />
    <Container>
      <SideBar />
      <div className="flex-1 overflow-auto min-h-[calc(100dvh-72px)]">
        <Outlet />
      </div>
    </Container>
    <Footer />
  </>
);

export default Dashboard;
