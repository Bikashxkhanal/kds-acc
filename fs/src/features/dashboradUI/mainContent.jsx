import Form from "../../components/common/Form/form.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import { searchCustomer } from "../../services/customer/customer.js";
import { useState } from "react";



const MainContent = () => {
        const [customer_id, setCustomerId] = useState('');

    return <main className="w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5 ">
            <SearchBar 
                placeholder="Search customers by name"
                searchQueryFn={searchCustomer}
                onSelect={(item) => console.log(item)
                }             
                />

                <Form useCase="createWorkEntry" datas={customer_id} />
                
            </main>
}

export default MainContent;

