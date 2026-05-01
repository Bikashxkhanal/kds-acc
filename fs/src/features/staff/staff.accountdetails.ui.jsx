import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom'
import { toast } from 'react-toastify';
import { getAStaffDetails, getAStaffRemunationAndPayoutDetails } from '../../services/staff/staff.api';
import PaginationBar from '../../components/common/Pagination/paginationbar';

const LIMIT = 10;

const StaffAccountDetails = () => {

    const {id} = useParams();
    const [page, setPage] = useState(1);
    const [staffPersonalDetails, setStaffPersonalDetails] = useState({})
    const [headers, setTableHeaders] = useState([]);
    const [staffRemuAndPayoutDetails , setStaffRemuAndPayoutDetails] = useState([])
    const [totalCount, setTotalCount] = useState(-1)


    useEffect(() => {
        ;(async () => {
            try {
                const response = await Promise.all(
                    [getAStaffDetails(id),
                    getAStaffRemunationAndPayoutDetails(id, {
                        page : page, 
                        limit : LIMIT
                    })]
                )
                console.log(response);
                
                setStaffPersonalDetails(response?.[0]?.data?.[0]);
                // setStaffRemuAndPayoutDetails(response?.[1]?.data)

                const headers = Object.keys(response?.[1]?.data?.result?.[0])
                setTableHeaders(headers);

                const details = response?.[1]?.data?.result?.map((each) => Object.values(each))
                setStaffRemuAndPayoutDetails(details);
                
                setTotalCount(response?.[1]?.data?.totalRows)
            

            } catch (error) {
                toast.error(error?.data?.message);
            }
        })()
    }, [page])

    console.log(staffPersonalDetails);
    console.log(staffRemuAndPayoutDetails);
    
    

    return (
     
            <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5 ">
                {/* personal Details Section */}
                <div className="w-[90%] py-5 flex flex-col gap-4 border border-yellow-700 bg-yellow-700 rounded-t-xl" >
                     <div className="text-xl text-center">
                        <span className="font-bold" > {staffPersonalDetails?.name}</span>
                    </div>
                    <div className=" flex flex-row justify-around text-lg">
                        <span >Address:
                        <span  > {staffPersonalDetails?.address} </span>
                        </span>
                        <span>Phone Number: {staffPersonalDetails?.phone_number} </span>
                    </div>

                   
                </div>

                {/* work and payment secttion must be shown based on work date latest to oldest */}
                <div className="w-[90%] text-center " >
                    <table className="w-full border-separate border-spacing-0 border-collapse border border-t-0 border-yellow-700">
                        <thead>
                            <tr>
                                {
                                   headers?.map((header, idx) => (
                                        <th key={idx}  className="text-center px-5 pb-4 border border-t-0 border-yellow-700"> {header} </th>
                                    ))
                                }

                            </tr>
                        </thead>

                        <tbody>
                            {
                                staffRemuAndPayoutDetails?.map((values, idx) => (
                                    <tr key={idx} >
                                      { 
                                       values?.map((value, idx) => (
                                        <td key={idx} className="text-center px-5 py-4 border border-yellow-700">
                                            {
                                                value ?? '-'
                                            }
                                        </td>
                                       ))
                                       }
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                    
                <PaginationBar current={page} total={totalCount} />
            </div>
        )

    
}

export default StaffAccountDetails;