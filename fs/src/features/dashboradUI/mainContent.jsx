import Form from "../../components/common/Form/form.jsx";
import SearchBar from "../../components/common/SearchBar.jsx";
import { searchCustomer , addWorkDetailsOfCustomer, addCustomerPaymentDetail} from "../../services/customer/customer.js";
import { useState } from "react";
import ToggleButton from "../../components/common/toggleButton.jsx";

import NepaliDate from "nepali-date-converter";
import { toast } from "react-toastify";




const MainContent = () => {
        const [customer_id, setCustomerId] = useState('');
        const [toggleForm, setToggleForm] = useState('work');
        const [isWorkDetailsSubmitSuccessfull, setIsWorkDetailsSubmitSuccessfull] = useState(false)
        const [isPaymentDetailsSubmitSuccessfull, setIsPaymentDetailsSubmitSuccessfull] = useState(false)

        const todayNepaliDate = new NepaliDate().format('YYYY-MM-DD');

        const handleWorkFormSubmit = async(data) => {
            try {
               const  response  = await addWorkDetailsOfCustomer(data);
               console.log(response);
               toast.success(response?.message)
                setIsWorkDetailsSubmitSuccessfull(() => true)
            } catch (error) {
                    setIsWorkDetailsSubmitSuccessfull(() => false)
                    toast.error(error?.message)
            }
            
                
        } 
        const handlePaymentFormSubmit = async (data) => {
                try {
                    const response = await addCustomerPaymentDetail(data);
                    console.log(response?.message);
                    toast.success(response?.message);
                   setIsPaymentDetailsSubmitSuccessfull(() => true)
                    
                } catch (error) {
                    toast.error(error?.message);
                    setIsPaymentDetailsSubmitSuccessfull(() => false)
                }
                
        } 

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
                        <Form useCase="createWorkEntry" 
                        datas={{customer_id : customer_id, work_date : todayNepaliDate} }
                         handleFormSubmit={(data) => handleWorkFormSubmit(data)} 
                         isSubmitSuccessfull={isWorkDetailsSubmitSuccessfull}
                         />
                    )
                }

                {
                    toggleForm === 'pay' && (
                         <Form useCase="createCustomerPaymentEntry" datas={{customer_id : customer_id, payment_date : todayNepaliDate} } handleFormSubmit={(data) => handlePaymentFormSubmit(data)} 
                         isSubmitSuccessfull={isPaymentDetailsSubmitSuccessfull}
                         />
                    )
                }
               
                
            </main>
}

export default MainContent;

