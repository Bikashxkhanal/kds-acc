import Form from "../../components/common/Form/form";
import { Button } from "../../components";
import SearchBar from "../../components/common/SearchBar"
import { searchCustomer , getAllCustomers} from "../../services/customer/customer";
import { useEffect, useState } from "react";
import Table from "../../components/common/Table/table";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import PaginationBar from "../../components/common/Pagination/paginationbar";

const PAGE_VALUE_LIMIT = 15;


const CustomerMainUI = () => {
    const [isAddCustomerFrmOpen, setIsAddCustomerFrmOpen] = useState(false);
    const [page, setPage] = useState(1);
    const [totalRows, setTotalRows] = useState(null);
    const [tableData, setTableData] = useState([]);

    useEffect( () => {
    ;(async() => {
            try {
            const response = await getAllCustomers({page : page, limit : PAGE_VALUE_LIMIT})
            console.log(response?.data);
            const finalTableData = response?.data?.rows;
        setTotalRows(Math.round(Number(response?.data?.metaData?.[0]?.totalCustomers) / PAGE_VALUE_LIMIT))
        
         finalTableData?.forEach((eachData) => 
            eachData.Actions = <Link 
                                to={`${eachData.id}`} 
                                className="text-blue-400 underline underline-offset-1" >
                                View</Link>
        )

        setTableData(finalTableData)
        // console.log(finalTableData);
        } catch (error) {
            toast.error(error?.message);
        }
    })()
    
    }, [page])

    
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
            <Table  tableData={tableData} />
        }
        
        <PaginationBar current={page} total={totalRows} onPageChange={(page) => setPage(page) }  />
       
            </main>

    )
}


export default CustomerMainUI;