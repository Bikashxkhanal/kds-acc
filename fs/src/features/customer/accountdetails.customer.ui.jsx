import { useEffect, useState } from "react";
import { getACustomerPersonalDetails, getACustomerWorkAndPaymentDetails } from "../../services/customer/customer";
import  {useParams} from 'react-router-dom'
import Table from "../../components/common/Table/table";


const AccountDetailsOfCustomer = () => {

    const {id:customer_id} = useParams();   
    
    const [customerPersonalDetails, setCustomerPersonalDetails] = useState({});
    const [customerWorkAndPaymentDetails, setCustomerWorkAndPaymentDetails] = useState([]);
    const [headers , setHeaders] = useState([]);
   
    const [page, setPage] = useState(1);
    
    useEffect(() => {
        ;(async() => {
            const response = await Promise.all( 
                [
                    getACustomerPersonalDetails(customer_id),
                    getACustomerWorkAndPaymentDetails(customer_id, page)
                ])

            console.log(response);
            setCustomerPersonalDetails({...customerPersonalDetails, ...response?.[0]?.[0]});
            setCustomerWorkAndPaymentDetails([...customerWorkAndPaymentDetails , ...response?.[1]]);
            

        })()
    }, [customer_id, page])


    useEffect(() => {
         if(customerWorkAndPaymentDetails.length){
     setHeaders(Object.keys(customerWorkAndPaymentDetails?.[0]))
    }
    }, [customerWorkAndPaymentDetails])
    

    const tableValues = customerWorkAndPaymentDetails?.map((data) => Object.values(data));


        return (
            <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5">
                {/* personal Details Section */}
                <div className="w-[90%] py-5 flex flex-col gap-4 border border-yellow-700 bg-yellow-700 rounded-t-xl" >
                     <div className="text-xl text-center">
                        <span className="font-bold" > {customerPersonalDetails?.name}</span>
                    </div>
                    <div className=" flex flex-row justify-around text-lg">
                        <span >Address:
                        <span  > {customerPersonalDetails?.address} </span>
                        </span>
                        <span>Phone Number: {customerPersonalDetails?.phone_number} </span>
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
                                tableValues?.map((values) => (
                                    <tr>
                                      { 
                                       values?.map((value) => (
                                        <td key={value} className="text-center px-5 py-4 border border-yellow-700">
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


            </div>
        )

}

export default AccountDetailsOfCustomer;