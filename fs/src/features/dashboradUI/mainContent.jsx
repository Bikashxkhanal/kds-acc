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
                onSelect={(item) => setCustomerId(item?.id)
                }             
                />

                <Form useCase="createWorkEntry" datas={{customer_id : customer_id, work_date : '2083-01-5'} } />
                
            </main>
}

export default MainContent;

