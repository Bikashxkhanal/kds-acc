import { useState } from "react";
import SearchBar from "../../components/common/SearchBar";
import ToggleButton from "../../components/common/toggleButton";
import Form from "../../components/common/Form/form";
import { searchStaffByName } from "../../services/staff/staff.api"; 



const StaffUI = ({}) => {

    const [activeForm, setActiveForm] = useState('remu');
    const [staffId, setStaffId] = useState(null);




    return (

        <div className="relative w-full md:w-4/5 min-h-screen flex flex-col items-center pt-5" >

        <SearchBar 
            placeholder="Search staff by name" 
            searchQueryFn={ searchStaffByName} 
            onSelect={(data) =>setStaffId(data?.id)} 
        />

          <ToggleButton
          //remu = remunation: earned value by the staff, payment: amount paid to staff
            options={['remu', 'payment']} 
            activeButton={(data) => setActiveForm(data)} />


        {
            activeForm == 'remu' && (
            <Form
             useCase="addStaffRemunationDetails"
            datas={{staff_id : staffId }} />
            )
        }



        {
            activeForm === 'payment' && (
                <Form useCase="addStaffPaymentDetails"
                    datas={{staff_id : staffId}}
                />
            )
        }

        </div>
    )
}


export default StaffUI;