import { useForm, useWatch } from "react-hook-form";
import { zodResolver} from '@hookform/resolvers/zod'
import { formConfig } from "./formConfig.js";
import { formSchema } from "./formSchema.js";
import InputBox from "../InputBox";
import Button from "../button.jsx";
import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import BSDateField from '../BSDateField.jsx';
import { bsToday, bsToIso, normalizeISODate } from '../../../utils/bsDate.js';
import { humanizeLabel } from "../../../utils/labels";
import { useI18n } from "../../../i18n/I18nProvider.jsx";

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
    const { option, t } = useI18n();
    const config = useMemo(() => formConfig[useCase] || [], [useCase]);
    const schema = formSchema(config);
    
    //name of the fields to be watched
    const watchedValues = config?.filter((eh) => eh?.watch)?.map(fld => fld.name);
    // console.log(watchedValues);
    
    //the field name for which the value is being watched
    const watchedFor = config?.filter(eh => eh?.watched)?.map(fld => fld.name)   
    // console.log(watchedFor);
     

    const {register, control, handleSubmit,setValue, getValues, reset, setError, formState : {errors}}  = useForm({
        resolver : zodResolver(schema),
        defaultValues: Object.fromEntries(config.map((field) => [field.name, field.type === 'date' ? bsToday() : ''])),
        mode: 'onBlur',
        reValidateMode: 'onChange'
    })


   const watchedVal = useWatch({
    control, 
    name : watchedValues
   })


    useEffect(() => {
        if(watchedValues.length > 0 && watchedFor.length > 0){
        const values = watchedVal?.map(eh => Number(eh) || 0)
        const finalValue = values?.reduce((prev, cur) => prev * cur, 1);
        // console.log(finalValue);
        
        const currentValue = getValues(watchedFor?.[0]);

        if(currentValue !== finalValue){
            setValue(watchedFor?.[0], finalValue || 0);
        }
    }

    }, [getValues, setValue, watchedFor, watchedVal, watchedValues])

     useEffect(() => {
        if(datas){
            const formData = { ...datas };
            config?.filter((field) => field.type === 'date').forEach((field) => { formData[field.name] = normalizeISODate(formData[field.name]); });
            reset(formData)
        }
    }, [reset, datas])

   

    useEffect(() => {
        // console.log("Outside")  
        const resetedValues = {}  
         config?.forEach(field => {
            resetedValues[field.name] = field.type === 'date' ? bsToday() : ''
        })
        if(isSubmitSuccessfull){
            // console.log("Inside"); 
            reset(resetedValues)
            
        }
    }, [config, isSubmitSuccessfull, reset])

  

    const onSubmitHandler = async (data) => {
        setIsLoading(true)
        try {
            const payload = { ...data };
            config?.filter((field) => field.type === 'date').forEach((field) => { payload[field.name] = bsToIso(payload[field.name]); });
            await handleFormSubmit?.(payload)
        } catch (error) {
            const fieldErrors = error?.response?.data?.errors || error?.fieldErrors || [];
            fieldErrors.forEach(({ field, message, code }) => {
                if (config.some((entry) => entry.name === field)) setError(field, { type: 'server', message: message || (code === 'invalid_date' ? 'date.invalid' : 'common.invalid') });
            });
            if (!fieldErrors.length) throw error;
        } finally {
            setIsLoading(false)
        }
    }

    return (
       <form onSubmit={handleSubmit(onSubmitHandler)} className="w-full kds-card p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {
            config?.map((fld) => (
                <div key={fld.name}>
                    {
                       ( fld.type === 'text' || fld.type === 'tel') && 
                            <InputBox 
                            placeholder={t(`field.${fld.name}`, { defaultValue: humanizeLabel(fld.name) })}
                             {...register(fld.name) }
                             
                             />
                        
                    }
                    {
                        fld.type === 'readOnly' && 
                        <InputBox className='bg-gray-900 readOnly:cursor-not-allowed text-gray-600' placeholder={t(`field.${fld.name}`, { defaultValue: humanizeLabel(fld.name) })} {...register(fld.name)} readOnly />
                    }

                    {
                       fld.type === 'select' &&
                        <select
                        className="kds-input"
                         {...register(fld.name)} 
                             >
                                <option value="">{t('common.selectA', { field: t(`field.${fld.name}`, { defaultValue: humanizeLabel(fld.name) }) })}</option>
                                {fld?.options?.map(opt => (<option key={opt} value={opt}>{option(opt)}</option>))}
                        </select>

                    }

                    {
                        fld.type === 'number' && 
                            <InputBox {...register(fld.name)} placeholder={t(`field.${fld.name}`, { defaultValue: humanizeLabel(fld.name) })} />
                        
                    }
                    {  fld.type === 'date' &&
                    <Controller 
                        control={control}
                        name={fld.name}
                        defaultValue={bsToday()}
                        render={({field, fieldState}) => (
                            <BSDateField required={fld.required} defaultToToday={fld.required !== false} className='kds-input' value={field?.value || ''} onChange={field.onChange} onBlur={field.onBlur} error={fieldState.error?.message} label={t(`field.${field?.name}`, { defaultValue: humanizeLabel(field?.name) })} />
                        
                        )}
                        />
                                       
                    }

                    {
                        errors[fld.name] && (
                            <p className="text-red-600">{t(errors[fld.name].message, { defaultValue: errors[fld.name].message })}</p>
                            
                        )

                    }

                    
                   
                </div>
            ))
        }

        <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3 pt-2">
            <Button children="Submit" loading={isLoading} type="submit" />
        </div>
       </form>
    )
}


export default Form;
