import { useEffect, useState } from "react";
import PaginationBar from "../../components/common/Pagination/paginationbar";
import Table from "../../components/common/Table/table";
import { getAllStaffs } from "../../services/staff/staff.api.js";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Button } from "../../components/index.js";

const PAGE_LIMIT= 12;
const StaffList = () => {

    const [staffDetails, setStaffDetails] = useState([]);
    const [page, setPage] = useState(1);
    const [staffCount, setStaffCount] = useState(-1);

    useEffect(() => {
        console.log("Inside")
        
        ;(async () => {
         try {
            console.log("Just Inside");
            
            const result = await getAllStaffs({page : page, limit : PAGE_LIMIT})
            // console.log("after call");
            const finalDetails = result?.data?.staffDetails;
            finalDetails?.forEach((detail) => 
                                        detail.Actions = <div className="" >
                                        <Link to={`/staff/${detail.id}`} className="text-blue-700 underline px-2" >
                                        View</Link>
                                        <button className="text-blue-700 underline px-2"   >Delete</button>
                                        </div>)
            setStaffDetails(() => finalDetails);
            setStaffCount(result?.data?.metaData?.staffCount);
            console.log(result);
            
        
         } catch (error) {
            toast.error(error?.data?.message);
         }   
        })() 

    }, [page])

    if(staffDetails.length == 0) return <p>bikash</p> ;

    return (
        <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5">
            <Table tableData={staffDetails} />

            <PaginationBar 
            current={page} 
            onPageChange={(page) => setPage(page) } 
            total={staffCount}
            />
        </div>
    )
}


export default StaffList;