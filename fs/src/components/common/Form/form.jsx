import { useForm } from "react-hook-form";
import { zodResolver} from '@hookform/resolvers/zod'
import { formConfig } from "./formConfig.js";
import { formSchema } from "./formSchema.js";
import InputBox from "../InputBox";
import Button from "../button.jsx";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import DatePicker from '@sbmdkl/nepali-datepicker-reactjs'
import "@sbmdkl/nepali-datepicker-reactjs/dist/index.css";

const Form = ({
    useCase = '',
    datas = {
        
    },
    handleFormSubmit,
    isSubmitSuccessfull = false
   
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const config = formConfig[useCase] || [];
    const schema = formSchema(config);
    

    const {register, control, handleSubmit, reset, formState : {errors}}  = useForm({
        resolver : zodResolver(schema)
    })

     useEffect(() => {
        if(datas){
            reset(datas)
        }
    }, [datas, reset])

   

    useEffect(() => {
        console.log("Outside")  
        const resetedValues = {}  
         config?.forEach(field => {
            resetedValues[field.name] = '' 
        })
        if(isSubmitSuccessfull){
            console.log("Inside"); 
            reset(resetedValues)
            
        }
    }, [isSubmitSuccessfull, reset])

  

    const onSubmitHandler = (data) => {
        handleFormSubmit?.(data)   
    }

    return (
       <form onSubmit={handleSubmit(onSubmitHandler)} className="min-w-screen md:min-w-full pt-5 md:pt-10 px-5 grid grid-cols-1 md:grid-cols-3 gap-3 justify-center">
        {
            config?.map((fld) => (
                <div key={fld.name}>
                    {
                       ( fld.type === 'text' || fld.type === 'tel') && 
                            <InputBox 
                            placeholder={fld.name.split("_").join(" ")}
                             {...register(fld.name) }
                             
                             />
                        
                    }
                    {
                        fld.type === 'readOnly' && 
                        <InputBox className='bg-gray-900 readOnly:cursor-not-allowed text-gray-600' placeholder={fld.name.split("_").join(" ")} {...register(fld.name)} readOnly />
                    }

                    {
                       fld.type === 'select' &&
                        <select
                        className="w-full  border border-gray-100 bg-white px-1 py-2 rounded-sm "
                         {...register(fld.name)} 
                             >
                                <option value="">Select a {fld.name.split("_").join(" ") }</option>
                                {fld?.options?.map(opt => (<option key={opt}> {opt} </option>))}
                        </select>

                    }

                    {
                        fld.type === 'number' && 
                            <InputBox {...register(fld.name)} placeholder={fld.name.split("_").join(" ")} />
                        
                    }
                    {  fld.type === 'date' &&
                    <Controller 
                        control={control}
                        name={fld.name}
                        render={({field}) => (
                            <DatePicker 
                            className='border border-gray-100 bg-white py-2 px-2 rounded-sm w-full'
                            value={field?.value || ""}
                            onChange={({bsDate, adDate}) => {
                                field?.onChange(bsDate)}}
                            placeholder={field?.name.split("_").join(" ")} />
                        
                        )}
                        />
                                       
                    }

                    {
                        errors[fld.name] && (
                            <p className="text-red-600">{errors[fld.name].message}</p>
                            
                        )

                    }

                    
                    {
                        console.log(errors[fld.name])
                        
                    }

                   
                </div>
            ))
        }

        <Button children="Submit" loading={isLoading} />

       </form>
    )
}


export default Form;