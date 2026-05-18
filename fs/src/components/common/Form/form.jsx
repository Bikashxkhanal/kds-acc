import { useForm, useWatch } from "react-hook-form";
import { zodResolver} from '@hookform/resolvers/zod'
import { formConfig } from "./formConfig.js";
import { formSchema } from "./formSchema.js";
import InputBox from "../InputBox";
import Button from "../button.jsx";
import { useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import DatePicker from '@sbmdkl/nepali-datepicker-reactjs'
import "@sbmdkl/nepali-datepicker-reactjs/dist/index.css";
import NepaliDate from "nepali-date-converter";

const Form = ({
    //use case of the form
    useCase = '',

    //default datas or dynamic datas 
    datas = {
        
    },

    handleFormSubmit,
    isSubmitSuccessfull = false
   
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const config = formConfig[useCase] || [];
    const schema = formSchema(config);
    
    //name of the fields to be watched
    const watchedValues = config?.filter((eh) => eh?.watch)?.map(fld => fld.name);
    // console.log(watchedValues);
    
    //the field name for which the value is being watched
    const watchedFor = config?.filter(eh => eh?.watched)?.map(fld => fld.name)   
    // console.log(watchedFor);
     

    const {register, control, handleSubmit,setValue, getValues, reset, formState : {errors}}  = useForm({
        resolver : zodResolver(schema)
    })


   const watchedVal = watchedValues?.length > 0 ? useWatch({
    control, 
    name : watchedValues
   }) : null


    useEffect(() => {
        if(watchedValues.length > 0){
        const values = watchedVal?.map(eh => Number(eh) || 0)
        const finalValue = values?.reduce((prev, cur) => prev * cur, 1);
        // console.log(finalValue);
        
        const currentValue = getValues(watchedFor?.[0]);

        if(currentValue !== finalValue){
            setValue(watchedFor?.[0], finalValue || 0);
        }
    }

    }, [watchedValues])

     useEffect(() => {
        if(datas){
            console.log(datas);
            
            reset(datas)
        }
    }, [reset, datas])

   

    useEffect(() => {
        // console.log("Outside")  
        const resetedValues = {}  
         config?.forEach(field => {
            resetedValues[field.name] = '' 
        })
        if(isSubmitSuccessfull){
            // console.log("Inside"); 
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
                        defaultValue={new NepaliDate().format('YYYY-MM-DD')}
                        render={({field}) => (
                            <DatePicker 
                            className='border border-gray-100 bg-white py-2 px-2 rounded-sm w-full'
                            value={field?.value || "" }
                            onChange={({bsDate, adDate}) => {
                                field?.onChange(bsDate)}}
                            placeholder={field?.name.split("_").join(" ")} 
                            language="en"
                            />
                        
                        )}
                        />
                                       
                    }

                    {
                        errors[fld.name] && (
                            <p className="text-red-600">{errors[fld.name].message}</p>
                            
                        )

                    }

                    
                   
                </div>
            ))
        }

        <Button children="Submit" loading={isLoading} />

       </form>
    )
}


export default Form;