import Form from "../../components/common/Form/form.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import { searchCustomer } from "../../services/customer/customer.js";
import WorkFillingForm from "./workFillingForm.jsx";


const MainContent = () => {
    return <main className="w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5 ">
            <SearchBar 
                placeholder="Search customers by name"
                queryFn={searchCustomer}
                searchedData={(data) => console.log(data)
                }

                
                />

                <Form useCase="createWorkEntry" />
                
            </main>
}

export default MainContent;

