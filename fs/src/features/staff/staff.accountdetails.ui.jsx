import { useEffect, useState } from 'react';
import {useParams} from 'react-router-dom'
import { toast } from 'react-toastify';
import { getAStaffDetails, getAStaffRemunationAndPayoutDetails, getAStaffPreviewDetails, downloadStaffDetailsPDF } from '../../services/staff/staff.api';
import PaginationBar from '../../components/common/Pagination/paginationbar';
import { getFinalCreditOrDebitValue } from '../../helpers/creditAndDebit.helper';
import Button from '../../components/common/button';
import DownloadPreview from '../../components/common/Preview/download-preview';
import DatePicker from '@sbmdkl/nepali-datepicker-reactjs';
import "@sbmdkl/nepali-datepicker-reactjs/dist/index.css";

const LIMIT = 10;

const StaffAccountDetails = () => {

    const {id} = useParams();
    const [page, setPage] = useState(1);
    const [staffPersonalDetails, setStaffPersonalDetails] = useState({})
    const [headers, setTableHeaders] = useState([]);
    const [staffRemuAndPayoutDetails , setStaffRemuAndPayoutDetails] = useState([])
    const [totalCount, setTotalCount] = useState(-1)

    const [selectedDates, setSelectedDates] = useState({
        startDate : null,
        endDate : null
    })

    const [previewDetails, setPreviewDetails] = useState({

    });

    const [isPreviewActive, setIsPreviewActive] = useState(false);

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
                // console.log(response);
                
                setStaffPersonalDetails(response?.[0]?.data);
                // setStaffRemuAndPayoutDetails(response?.[1]?.data)

                 const finalValues = getFinalCreditOrDebitValue(response?.[1]?.data?.result);
                response?.[1]?.data?.result?.forEach((detail, idx) => detail.Total = finalValues[idx])

                const headers = response?.[1]?.data?.result?.length ? Object.keys(response?.[1]?.data?.result?.[0]) : []
                setTableHeaders(headers);

                const details = response?.[1]?.data?.result?.map((each) => Object.values(each)) || []
                
                setStaffRemuAndPayoutDetails(details);
                
                setTotalCount(Math.max(1, Math.ceil(Number(response?.[1]?.data?.totalRows || 0) / LIMIT)))
            

            } catch (error) {
                toast.error(error?.data?.message);
            }
        })()
    }, [id, page])

    // console.log(staffPersonalDetails);
    // console.log(staffRemuAndPayoutDetails);
    
    const handleDateChange = (type , date) => {
        setSelectedDates((prev) => ({
            ...prev,
            [type] : date
        }))
    }

    const handlePreviewClick = async() => {
        // console.log(selectedDates);
        try {
            const res = await getAStaffPreviewDetails(id, {startDate : selectedDates?.startDate?.bsDate, endDate : selectedDates?.endDate?.bsDate});
            // console.log(res);
            
            setPreviewDetails(res?.data)
           setIsPreviewActive(true)
            
        } catch (error) {
            toast.error(error?.message || "Failed to load preview");
            setIsPreviewActive(false)
        }
    }

    

    const handleDownload = async() => {
        try {
             await downloadStaffDetailsPDF(id , {startDate : selectedDates?.startDate?.bsDate, endDate : selectedDates?.endDate?.bsDate})

        } catch (error) {
            toast.error(error?.message || "Failed to download PDF")
        }
    }

    return (
     
            <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5 ">
                <div className='flex flex-col gap-2 my-2 md:flex-row items-center'>
                    <DatePicker 
                    selected={selectedDates.startDate}
                    onChange={(date) => handleDateChange('startDate', date)}
                    className="border border-gray-400 mx-2 px-2 py-1 rounded-lg bg-white"
                    language='en'
                      />
                    <DatePicker 
                    selected={selectedDates.endDate}
                    onChange={(date) => handleDateChange('endDate', date)}
                    className="border border-gray-400 mx-2 px-2 py-1 rounded-lg bg-white"
                    language='en'
                     />
                    <Button children='Preview' onClick={() => handlePreviewClick()} />
                </div>

                {
                    isPreviewActive && (
                        <DownloadPreview 
                        title="Staff Work And Payment Details" 
                        data={previewDetails} 
                        handleClickOut={() => setIsPreviewActive(false)}
                        handleClick={() => handleDownload()
                        } />
                    )
                }

                {/* personal Details Section */}
                <div className="w-screen md:w-[90%] py-2 md:py-5 flex flex-col gap-4 border border-yellow-700 bg-yellow-700 rounded-t-xl text-sm md:text-lg" >
                     <div className="text-lg md:text-2xl text-center">
                        <span className="font-bold" > {staffPersonalDetails?.name}</span>
                    </div>
                    <div className=" flex flex-row justify-around">
                        <span >Address:
                        <span  > {staffPersonalDetails?.address} </span>
                        </span>
                        <span>Phone Number: {staffPersonalDetails?.phone_number} </span>
                        <span>Salary: Rs.{staffPersonalDetails?.salary}</span>
                    </div>

                   
                </div>

                {/* work and payment secttion must be shown based on work date latest to oldest */}
                <div className="w-screen md:w-[90%] text-center " >
                    <table className="w-screen md:w-full border-separate border-spacing-0 border-collapse border border-t-0 border-yellow-700">
                        <thead>
                            <tr>
                                {
                                   headers?.map((header, idx) => (
                                        <th key={idx}  className="text-center px-1 md:px-5 pb-2 md:pb-4 border border-t-0 border-yellow-700"> {header} </th>
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
                                        <td key={idx} className="text-center px-2 md:px-5 py-2 md:py-4 border border-yellow-700">
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
                    
                <PaginationBar current={page} total={totalCount} onPageChange={(page) => setPage(page)} />
            </div>
        )

    
}

export default StaffAccountDetails;
