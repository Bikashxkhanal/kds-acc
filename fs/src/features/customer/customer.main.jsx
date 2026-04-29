import Form from "../../components/common/Form/form";
import { Button } from "../../components";
import SearchBar from "../../components/common/SearchBar"
import { searchCustomer } from "../../services/customer/customer";
import { useState } from "react";
import Table from "../../components/common/Table/table";


const CustomerMainUI = () => {
    const [isAddCustomerFrmOpen, setIsAddCustomerFrmOpen] = useState(false);

    const testTableData = {
        tableHeader : ['SN', 'Customer Name', 'Phone number', 'Address', 'Payable Amount', 'Actions'], 
        tableBody : [
            [
                1, 'Ramesh Baniya', 'Phone number', 'Address', 'Payable Amount', 'Actions'
            ],
            [
                2, 'Amar Kshetri', 'Phone number', 'Address', 'Payable Amount', 'Actions'
            ]
        ]
    }

    return (<main className="w-full md:w-4/5 min-h-screen flex flex-col items-center gap-4 pt-5 ">
        <div className="flex flex-col gap-2" >
            <SearchBar placeholder="Search customer by name" searchQueryFn={searchCustomer} 
            />
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

        {
            <Table  tableData={testTableData} />
        }
            </main>

    )
}


export default CustomerMainUI;