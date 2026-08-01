import { useEffect, useState } from "react";
import { getACustomerPersonalDetails, getACustomerWorkAndPaymentDetails, getACustomerWorkAndPaymentPreviewData, downLoadWorkAndPaymentDataPdf } from "../../services/customer/customer";
import  {useParams} from 'react-router-dom'
import PaginationBar from "../../components/common/Pagination/paginationbar";
import { getFinalCreditOrDebitValue } from "../../helpers/creditAndDebit.helper";
import Button from "../../components/common/button";
import DownloadPreview from "../../components/common/Preview/download-preview";
import DatePicker from '@sbmdkl/nepali-datepicker-reactjs';
import "@sbmdkl/nepali-datepicker-reactjs/dist/index.css";
import {toast} from 'react-toastify'



const PAGE_LIMIT = 10;

const AccountDetailsOfCustomer = () => {

    const {id: customer_id} = useParams();   
    
    const [customerPersonalDetails, setCustomerPersonalDetails] = useState({});
    //work-pay details of customer
    const [customerWorkAndPaymentDetails, setCustomerWorkAndPaymentDetails] = useState([]);

    //totalRows is the metadata where it gives the total number of row count of work-pay-details of a particular customer
    const [totalRows, setTotalRows] = useState(null); 

    //for showing and hiding the date range selectors for downloading/printing the a/c details 
    const [selectedDates, setSelectedDates] = useState({
        startDate : null, 
        endDate : null
    })
   
    //pagination page
    const [page, setPage] = useState(1);

       // to show the preview data of the downloadable customer information
    const [isPreviewOpen, setIsPreviewOpen] = useState(false)

    // preview data 
    const [previewData, setPreviewData] = useState({});
    
    useEffect(() => {
        ;(async() => {
            const response = await Promise.all( 
                [
                    getACustomerPersonalDetails(customer_id),
                    getACustomerWorkAndPaymentDetails(customer_id, { page : page, limit: PAGE_LIMIT})
                ])

            setCustomerPersonalDetails(response?.[0]?.[0]);

            const workAndPaymentDetails = response?.[1]?.workAndPaymentDetails || [];
            const finalValues = getFinalCreditOrDebitValue(workAndPaymentDetails);
            workAndPaymentDetails?.forEach((each, idx) => each.Total = finalValues[idx])
            setCustomerWorkAndPaymentDetails([...workAndPaymentDetails]);
            setTotalRows(() => Math.max(1, Math.ceil(Number(response?.[1]?.metaData?.[0]?.totalRows || 0) / PAGE_LIMIT)));

        })()
    }, [customer_id, page])
    

    const headers = customerWorkAndPaymentDetails.length ? Object.keys(customerWorkAndPaymentDetails[0]) : [];
    const tableValues = customerWorkAndPaymentDetails?.map((data) => Object.values(data));
    // console.log(tableValues);
    

    const handlePageChange = (page) => {
        // console.log("Pag", page);
        
        setPage(() => page);
    }
    // console.log("After change",page);

    const handleDateChange = (type , date) => {
        setSelectedDates(
            (prev) => ({
                ...prev, 
                [type]: date
            })
        )
        
    }

    const handleDownloadPreview = async (e) => {
        e.preventDefault();
        try {
            if(!selectedDates?.startDate?.bsDate || !selectedDates?.endDate?.bsDate) {
                toast.error("Select both start and end dates")
                return
            }
            
          const response =   await getACustomerWorkAndPaymentPreviewData(
                                customer_id ,
                                {
                                    from : selectedDates?.startDate?.bsDate,
                                    to : selectedDates?.endDate?.bsDate,
                                     
                                })
        const updatedValue = {
            ...previewData, ...response?.data
        }
        // console.log(updatedValue);
        
        setPreviewData(updatedValue)
        setIsPreviewOpen(true)
        // console.log(previewData);
        
        
        } catch (error) {
            toast.error(error?.message || "Failed to load preview")
        }
        
    }

    const handlePreviewClickOutside = () => {
        // console.log("OUTSIDE CLICK");
        
        setIsPreviewOpen(false)
    }

    const handleCustomerInfoDownload = async() => {
            try {
               await downLoadWorkAndPaymentDataPdf(customer_id, {from : selectedDates?.startDate?.bsDate, to : selectedDates?.endDate?.bsDate})
                setIsPreviewOpen(false)

            } catch (error) {
                toast.error(error?.message || "Failed to download PDF")
                setIsPreviewOpen(false)
            
            }
    }
    

        return (
            <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center text-sm md:mt-4 md:text-lg">
                {
                isPreviewOpen && <DownloadPreview data={previewData} 
                handleClickOut={handlePreviewClickOutside} handleClick={handleCustomerInfoDownload} />
            }
                {/* PRINT/DOWNLOAD BUTTON FOR DOWNLOADING OR PRINTING THE DETAILS OF THE CUSTOMER A/C */}
                <form  className="flex flex-col flex-start gap-3 mb-3 md:flex-row md:justify-center md:items-center md:gap-8 text-center"  >

                    <DatePicker 
                        selected = {selectedDates?.startDate}
                        onChange = { (date) => handleDateChange('startDate', date)}
                        className="border border-gray-400 mx-2 px-2 py-1 rounded-lg bg-white" 
                        language="en"
                    />

                    <DatePicker
                        selected = {selectedDates?.endDate}
                        onChange = { (date) => handleDateChange('endDate', date)}
                        className="border border-gray-400 mx-2 px-2 py-1 rounded-lg bg-white"
                        language="en"
                    />

                    <Button 
                        children="Preview" 
                        varient="primary" 
                        size={"sm"} 
                        onClick={handleDownloadPreview}

                         />

                </form>

               

                {/* personal Details Section */}
                <div className="w-screen md:w-[90%] py-2 md:py-5 flex flex-col gap-2 md:gap-4 border border-yellow-700 bg-yellow-700 rounded-t-xl text-center" >
                     <div className="text-lg md:text-2xl text-center">
                        <span className="font-bold" > {customerPersonalDetails?.name}</span>
                    </div>
                    <div className="flex flex-row justify-around gap-2">
                        <span >Address:
                        <span  > {customerPersonalDetails?.address} </span>
                        </span>
                        <span>Phone Number: {customerPersonalDetails?.phone_number} </span>
                    </div>

                   
                </div>

                {/* work and payment secttion must be shown based on work date latest to oldest */}
                <div className="w-screen md:w-[90%] text-center" >
                    <table className="w-screen md:w-full border-separate border-spacing-0 border-collapse border border-t-0 border-yellow-700">
                        <thead>
                            <tr>
                                {
                                   headers?.map((header) => (
                                        <th key={header}  className="text-center px-0 md:px-5 pb-4 border border-t-0 border-yellow-700"> {header} </th>
                                    ))
                                }

                            </tr>
                        </thead>

                        <tbody>
                            {
                               tableValues.length > 0 ?  tableValues?.map((values, index) => (
                                    <tr key={index}>
                                      { 
                                       values?.map((value, idx) => (
                                        <td key={idx} className="text-center px-2 md:px-5 py-2 md:py-4 border border-yellow-700">
                                            {
                                                value || '-'
                                            }
                                        </td>
                                       ))
                                       }
                                    </tr>
                                )) : (
                                    <tr>
                                        <td className="text-gray-400 py-2 md:py-5" colSpan={Math.max(headers.length, 1)}>No data found</td>
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                </div>
                    
                <PaginationBar current={page} total={totalRows} onPageChange={handlePageChange} />
            </div>
        )

}

export default AccountDetailsOfCustomer;
