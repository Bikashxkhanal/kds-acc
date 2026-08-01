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
            const finalDetails = result?.data?.staffDetails || [];
            finalDetails?.forEach((detail) => 
                                        detail.Actions = <div className="" >
                                        <Link to={`/staff/${detail.id}`} className="text-blue-700 underline px-2" >
                                        View</Link>
                                        <button className="text-blue-700 underline px-2"   >Delete</button>
                                        </div>)
            setStaffDetails(() => finalDetails);
            setTotalPages(Math.max(1, Math.ceil(Number(result?.data?.metaData?.[0]?.staffCount || 0) / PAGE_LIMIT)));
            
        
         } catch (error) {
            toast.error(error?.data?.message);
         }   
        })() 

    }, [page])

    return (
        <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5">
            <Table tableData={staffDetails} />

            <PaginationBar 
            current={page} 
            onPageChange={(page) => setPage(page) } 
            total={totalPages}
            />
        </div>
    )
}


export default StaffList;
