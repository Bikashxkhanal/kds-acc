import Form from "../../components/common/Form/form";
import { Button } from "../../components";
import SearchBar from "../../components/common/SearchBar"
import { searchCustomer , getAllCustomers, addNewCustomer} from "../../services/customer/customer";
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
        const finalTableData = (response?.data?.rows || []).map(({ id, _id, ...customer }) => ({
            "Customer ID": _id,
            ...customer,
            Actions: <Link to={`${id}`} className="font-medium text-[#12355b] hover:text-sky-600 hover:underline">View details</Link>
        }));
        setTotalRows(Math.max(1, Math.ceil(Number(response?.data?.metaData?.[0]?.totalCustomers || 0) / PAGE_VALUE_LIMIT)))
        
        setTableData(finalTableData)
        // console.log(finalTableData);
        } catch (error) {
            toast.error(error?.message);
        }
    })()
    
    }, [page])

    const handleSubmit = async (data) => {
        try {
            // console.log(data);
            
            const response = await addNewCustomer(data);
            toast.success(response?.message)
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    return (
        <main className="kds-page">
            <div className="grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div />
                <SearchBar className="kds-search mx-auto w-full" placeholder="Search customers" searchQueryFn={searchCustomer} />
                <div className="flex justify-center sm:justify-end"><Button children="Add New Customer" size="sm" onClick={() => setIsAddCustomerFrmOpen(true)} /></div>
            </div>

        {
            isAddCustomerFrmOpen && <Form useCase="addNewCustomer" 
                                    handleFormSubmit={(data) => handleSubmit(data)} 
                                    />
            
        }

        {
            <Table  tableData={tableData} />
        }
        
        <PaginationBar current={page} total={totalRows} onPageChange={(page) => setPage(page) }  />
       
            </main>

    )
}


export default CustomerMainUI;
