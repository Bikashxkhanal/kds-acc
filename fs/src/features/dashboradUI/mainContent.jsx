import Form from "../../components/common/Form/form.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import { searchCustomer } from "../../services/customer/customer.js";
import { useState } from "react";
import ToggleButton from "../../components/common/toggleButton.jsx";



const MainContent = () => {
        const [customer_id, setCustomerId] = useState('');
        const [toggleForm, setToggleForm] = useState('work');

    return <main className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5 ">
            <SearchBar 
                placeholder="Search customers by name"
                searchQueryFn={searchCustomer}
                onSelect={(item) => setCustomerId(item?.id)
                }             
                />
                <div className="mt-2 md:mt-0 md:fixed md:right-10" >
                <ToggleButton options={['work', 'pay']} activeButton={(data) => setToggleForm(() => data) 
                } />
                </div>

                {
                    toggleForm === 'work'  && (
                        <Form useCase="createWorkEntry" datas={{customer_id : customer_id, work_date : '2083-01-05'} } />
                    )
                }

                {
                    toggleForm === 'pay' && (
                         <Form useCase="createCustomerPaymentEntry" datas={{customer_id : customer_id, payment_date : '2083-01-05'} } />
                    )
                }
               
                
            </main>
}

export default MainContent;

