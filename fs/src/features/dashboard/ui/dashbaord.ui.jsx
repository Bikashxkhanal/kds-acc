import { useSelector } from "react-redux";

const Dashboard = () => {
    const {user, authStatus, loadingStat} = useSelector(state => state.auth);
    console.log(user);
    if(loadingStat)return <div>Loading...</div>

    return <h1>Welcome to {user?.name}</h1>
}

export default Dashboard;