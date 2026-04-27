import Form from "../../components/common/Form/form";
import { Button } from "../../components";
import SearchBar from "../../components/common/SearchBar"
import { searchCustomer } from "../../services/customer/customer";
import { useState } from "react";


const CustomerMainUI = () => {
    const [isAddCustomerFrmOpen, setIsAddCustomerFrmOpen] = useState(false);

    return (<main className="w-full md:w-4/5 min-h-screen flex flex-col items-center gap-4 pt-5 ">
        <div className="flex flex-col gap-2" >
            <SearchBar placeholder="Search customer by name" queryFn={searchCustomer} searchedData={(data) => console.log(data)
            } />
            <Button 
            children="Add New Customer" size='sm'  
            onClick={() => 
                setIsAddCustomerFrmOpen(true)
            } />

        </div>

        {
            isAddCustomerFrmOpen && (
               <Form useCase="addNewCustomer" />
            )
        }
            </main>

    )
}


export default CustomerMainUI;