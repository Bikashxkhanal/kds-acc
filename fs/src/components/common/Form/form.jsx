import { useForm } from "react-hook-form";
import { zodResolver} from '@hookform/resolvers/zod'
import { formConfig } from "./formConfig.js";
import { formSchema } from "./formSchema.js";
import InputBox from "../InputBox";
import Button from "../button.jsx";
import { useState } from "react";

const Form = ({
    useCase = ''
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const config = formConfig[useCase] || [];
    const schema = formSchema(config);

    const {register, handleSubmit,  formState : {errors}}  = useForm({
        resolver : zodResolver(schema)
    })

    const onSubmitHandler = (data) => {
        console.log(data);
        
    }

    return (
       <form onSubmit={handleSubmit(onSubmitHandler)} className="min-w-screen md:min-w-full pt-5 md:pt-10 px-5 grid grid-cols-1 md:grid-cols-3 gap-3 justify-center">
        {
            config?.map((field) => (
                <div key={field.name}>
                    {
                       ( field.type === 'text' || field.type === 'tel') && 
                            <InputBox placeholder={field.name.split("_").join(" ")} {...register(field.name)} />
                        
                    }
                    {
                        field.type === 'readOnly' && 
                        <InputBox className='bg-gray-900 readOnly:cursor-not-allowed text-gray-600' placeholder={field.name.split("_").join(" ")} {...register(field.name)} readOnly />
                    }

                    {
                       field.type === 'select' &&
                        <select
                        className="w-full  border border-gray-100 bg-white px-1 py-2 rounded-sm "
                         {...register(field.name)} 
                            onChange={(e) => register(field.name).onChange(e)} >
                                <option value="">Select a {field.name.split("_").join(" ") }</option>
                                {field?.options?.map(opt => (<option key={opt}> {opt} </option>))}
                        </select>
                       
                    }

                    {
                        field.type === 'number' && 
                            <InputBox {...register(field.name)} placeholder={field.name.split("_").join(" ")} />
                        
                    }

                    {
                        errors[field.name] && (
                            <p className="text-red-600">{errors[field.name].message}</p>
                            
                        )

                    }
                    {
                        console.log(errors[field.name])
                        
                    }

                   
                </div>
            ))
        }

        <Button children="Submit" loading={isLoading} />

       </form>
    )
}


export default Form;