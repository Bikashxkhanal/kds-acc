import { useState } from "react";
import SearchBar from "../../components/common/SearchBar";
import ToggleButton from "../../components/common/toggleButton";
import Form from "../../components/common/Form/form";
import { searchStaffByName ,addStaffRemunation, addStaffPayout} from "../../services/staff/staff.api"; 
import { toast } from "react-toastify";
import { Button } from "../../components";
import { useNavigate } from "react-router-dom";
import ReceiptButtons from "../../components/common/ReceiptButtons.jsx";



const StaffUI = () => {

    const [activeForm, setActiveForm] = useState('remu');
    const [staffId, setStaffId] = useState(null);
    const [isRemuSubmitSuccessfull, setIsRemuSubmitSuccessfull] = useState(false)
    const [isPayoutSubmitSuccessfull, setIsPayoutSubmitSuccessfull] = useState(false)
    const [receiptPaymentId, setReceiptPaymentId] = useState(null)

    const navigate = useNavigate()

    const handleRemunationSubmission = async(data) => {
        try {
            const result = await addStaffRemunation(data);
            console.log(result?.data);
            toast.success(result?.message)
            setIsRemuSubmitSuccessfull(true)
            
        } catch (error) {
            setIsRemuSubmitSuccessfull(false);
            toast.error(error?.data?.message);
        }
    }

    const handlePayoutDetails = async (data) => {
        try {
            const result = await addStaffPayout(data);
            toast.success(result?.message)
            setIsPayoutSubmitSuccessfull(true)
            setReceiptPaymentId(result?.data?.lastInsertedId)
        } catch (error) {
            setIsPayoutSubmitSuccessfull(false)
            toast.error(error?.data?.message);
        }
    }



    return (

        <main className="kds-page" >
        <div className="grid w-full grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]"><div /> <SearchBar
            className="kds-search mx-auto w-full"
            placeholder="Search staff by name" 
            searchQueryFn={ searchStaffByName} 
            onSelect={(data) =>setStaffId(data?.id)} 
        /><div className="flex justify-center gap-2 sm:justify-end"><Button children="Add Staff" size="sm" onClick={() => navigate('/staff/new') } /><Button children="View Staff" size="sm" onClick={() => navigate('/staff/all') } /></div></div>
        <div className="flex justify-center"><ToggleButton
          //remu = remunation: earned value by the staff, payment: amount paid to staff
            options={['remu', 'payout']} 
            activeButton={(data) => setActiveForm(data)} 
        /></div>


        {
            activeForm == 'remu' && (
            <Form
             useCase="addStaffRemunationDetails"
             handleFormSubmit={(data) => handleRemunationSubmission(data)}
            datas={{staff_id : staffId }}
            isSubmitSuccessfull={isRemuSubmitSuccessfull}
            />
            )
        }


        {
            activeForm === 'payout' && (
                <Form useCase="addStaffPaymentDetails"
                    datas={{staff_id : staffId}}
                    handleFormSubmit={(data) => handlePayoutDetails(data)}
                    isSubmitSuccessfull={isPayoutSubmitSuccessfull}
                />
            )
        }
        {receiptPaymentId && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4" role="dialog" aria-modal="true"><section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"><h2 className="text-xl font-bold text-[#12355b]">Payment saved</h2><p className="mt-2 text-sm text-slate-500">Receipt STAFF-{String(receiptPaymentId).padStart(6, '0')} is ready.</p><div className="mt-5 flex items-center justify-between"><ReceiptButtons type="staff" id={receiptPaymentId} /><button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setReceiptPaymentId(null)}>Done</button></div></section></div>}
        </main>
    )
}


export default StaffUI;
