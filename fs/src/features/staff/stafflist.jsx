import { useEffect, useState } from "react";
import PaginationBar from "../../components/common/Pagination/paginationbar";
import Table from "../../components/common/Table/table";
import { getAllStaffs } from "../../services/staff/staff.api.js";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const PAGE_LIMIT= 12;
const StaffList = () => {

    const [staffDetails, setStaffDetails] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        ;(async () => {
         try {
            const result = await getAllStaffs({page : page, limit : PAGE_LIMIT})
            const finalDetails = (result?.data?.staffDetails || []).map((detail) => ({
              ...detail,
              Actions: <div className="flex items-center gap-3"><Link to={`/staff/${detail.id}`} className="font-medium text-[#12355b] hover:underline">View details</Link><button className="text-slate-400 hover:text-red-600">Delete</button></div>
            }));
            setStaffDetails(() => finalDetails);
            setTotalPages(Math.max(1, Math.ceil(Number(result?.data?.metaData?.[0]?.staffCount || 0) / PAGE_LIMIT)));
            
        
         } catch (error) {
            toast.error(error?.data?.message);
         }   
        })() 

    }, [page])

    return (
        <main className="kds-page">
            <div><p className="text-xs font-semibold uppercase tracking-widest text-sky-600">Human resources</p><h1 className="text-2xl font-bold text-[#12355b]">Staff Directory</h1><p className="text-sm text-slate-500">Manage staff profiles and account activity.</p></div>
            <Table tableData={staffDetails} />

            <PaginationBar 
            current={page} 
            onPageChange={(page) => setPage(page) } 
            total={totalPages}
            />
        </main>
    )
}


export default StaffList;
