import { useState } from "react";
import SearchBar from "../../components/common/SearchBar";
import ToggleButton from "../../components/common/toggleButton";
import Form from "../../components/common/Form/form";
import { searchStaffByName ,addStaffRemunation, addStaffPayout} from "../../services/staff/staff.api"; 
import { toast } from "react-toastify";
import { Button } from "../../components";
import { useNavigate } from "react-router-dom";



const StaffUI = ({}) => {

    const [activeForm, setActiveForm] = useState('remu');
    const [staffId, setStaffId] = useState(null);
    const [isRemuSubmitSuccessfull, setIsRemuSubmitSuccessfull] = useState(false)
    const [isPayoutSubmitSuccessfull, setIsPayoutSubmitSuccessfull] = useState(false)

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
        } catch (error) {
            setIsPayoutSubmitSuccessfull(false)
            toast.error(error?.data?.message);
        }
    }



    return (

        <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5" >
        <SearchBar 
            placeholder="Search staff by name" 
            searchQueryFn={ searchStaffByName} 
            onSelect={(data) =>setStaffId(data?.id)} 
        />

        <ToggleButton
          //remu = remunation: earned value by the staff, payment: amount paid to staff
            options={['remu', 'payout']} 
            activeButton={(data) => setActiveForm(data)} 
        />

        <Button children="View Staffs" onClick={() => navigate('all') } />


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

        </div>
    )
}


export default StaffUI;