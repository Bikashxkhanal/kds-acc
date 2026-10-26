import Form from "../../components/common/Form/form";
import { Button } from "../../components";
import { getAllCustomers, addNewCustomer, updateCustomer} from "../../services/customer/customer";
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
    const [filters, setFilters] = useState({ q: '', customer_type: '', location: '' });
    const [editing, setEditing] = useState(null);


    useEffect( () => {
    ;(async() => {
            try {
            const response = await getAllCustomers({page : page, limit : PAGE_VALUE_LIMIT, ...filters})
        const finalTableData = (response?.data?.rows || []).map(({ id, _id, ...customer }) => ({
            "Customer ID": id,
            ...customer,
            Actions: <><Link to={`/customers/${id}`} className="mr-3 font-medium text-[#12355b] hover:text-sky-600 hover:underline">View details</Link><button className="text-blue-700" onClick={() => setEditing({ id, name: customer.name, phone_number: customer.phone_number, address: customer.address || '', customer_type: customer.customer_type || 'Private' })}>Edit</button></>
        }));
        setTotalRows(Math.max(1, Math.ceil(Number(response?.data?.metaData?.[0]?.totalCustomers || 0) / PAGE_VALUE_LIMIT)))
        
        setTableData(finalTableData)
        // console.log(finalTableData);
        } catch (error) {
            toast.error(error?.message);
        }
    })()
    
    }, [page, filters])

    const handleSubmit = async (data) => {
        try {
            // console.log(data);
            
            const response = await addNewCustomer(data);
            toast.success(response?.message)
            setIsAddCustomerFrmOpen(false); setPage(1);
            const refreshed = await getAllCustomers({ page: 1, limit: PAGE_VALUE_LIMIT, ...filters });
            setTableData((refreshed?.data?.rows || []).map((row) => ({ "Customer ID": row.id, ...row, Actions: <><Link className="mr-3" to={`/customers/${row.id}`}>View details</Link><button className="text-blue-700" onClick={() => setEditing({ id: row.id, name: row.name, phone_number: row.phone_number, address: row.address || '', customer_type: row.customer_type || 'Private' })}>Edit</button></> })));
        } catch (error) {
            toast.error(error.message);
        }
    }

    const handleUpdate = async (data) => {
        try { const response = await updateCustomer(editing.id, data); toast.success(response?.message || 'Customer updated'); setEditing(null); setFilters((f) => ({ ...f })); }
        catch (error) { toast.error(error?.message || 'Unable to update customer'); }
    };
    
    return (
        <main className="kds-page">
            <div className="grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
                <div />
                <input aria-label="Search customers by name or phone" className="kds-input kds-search mx-auto w-full" placeholder="Search name or phone" value={filters.q} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, q: e.target.value })); }} />
                <div className="flex justify-center sm:justify-end"><Button children="Add New Customer" size="sm" onClick={() => setIsAddCustomerFrmOpen(true)} /></div>
            </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="kds-label">Customer type<select className="kds-input mt-1" value={filters.customer_type} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, customer_type: e.target.value })); }}><option value="">All types</option>{['Private', 'Governmental', 'NGO'].map((v) => <option key={v}>{v}</option>)}</select></label>
          <label className="kds-label">Location<input className="kds-input mt-1" placeholder="Filter by address" value={filters.location} onChange={(e) => { setPage(1); setFilters((f) => ({ ...f, location: e.target.value })); }} /></label>
        </div>

        {
            isAddCustomerFrmOpen && <Form useCase="addNewCustomer" 
                                    handleFormSubmit={(data) => handleSubmit(data)} 
                                    />
            
        }
        {editing && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"><section className="w-full max-w-4xl rounded-xl bg-white p-5"><div className="mb-3 flex justify-between"><h2 className="font-semibold">Edit customer</h2><button onClick={() => setEditing(null)}>Close</button></div><Form key={editing.id} useCase="addNewCustomer" datas={editing} handleFormSubmit={handleUpdate} /></section></div>}

        {
            <Table  tableData={tableData} />
        }
        
        <PaginationBar current={page} total={totalRows} onPageChange={(page) => setPage(page) }  />
       
            </main>

    )
}


export default CustomerMainUI;
