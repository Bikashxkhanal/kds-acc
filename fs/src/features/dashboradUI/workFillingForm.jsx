import { useState } from "react";
import { InputBox } from "../../components";

const WorkFillingForm = ({
    customerDetails = {}
}) => {
    const [workDetails, setWorkDetails] = useState({
            customer_id : null,
            vehicle_id : null,
            title : '',
            quantity : null,
            quantity_unit_notation : '',
            rate : null,
            work_date : ''

    });

    const handleSubmit = (data) => {
            console.log(data);
            
    }
    return  (<>
            <form action="" className="flex flex-wrap gap-2"  onSubmit={handleSubmit} >
                {/* date, vechile,  customer_name/id, title, quantity, quantiy_unit_notation, rate */}
                {/* for customer name , when the searched customer is selected, its id must be passed to the input-box to display as a value */}

                    <input type="text" value={customerDetails?.id}  readOnly/> 
                    <InputBox className="w-10" />
                    <InputBox className="w-10"/> 
                    <InputBox className="w-1/2"/>
                    <InputBox className="w-1/2"/>
                    <InputBox className="w-1/2"/>
                    <InputBox className="w-1/2"/>
            </form>


            </>)

    }

export default WorkFillingForm;