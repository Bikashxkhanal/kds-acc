import {preprocess, z} from 'zod'
import NepaliDate from 'nepali-date-converter'

export const formSchema = (fields = []) => {
    const shape = {}
    console.log(fields);
    
    fields?.forEach((field) => {
        let rule ;
        switch (field.type) {
            case 'text':
            case 'tel': 
                    rule = z.string({
                        required_error : `${field.name} is required`,
                        invalid_type_error : `${field.name} type is invalid`
                    });

                    if(field.required) {
                        rule = rule.min(1, `${field.name} min is required`)
                    }
                    
                    if(field.min && field.min > 1) {
                        rule = rule.min(1, `${field.name} is required`)
                    }
                    

                    if(field.max){
                        rule = rule.max(field.max, `${field.name} cannot exceed ${field.max}`)
                    }

                    break;


            case 'number' : 
                    rule = z.coerce.number({
                        required_error : `${field.name.split('_').join(" ")} is required`,
                        invalid_type_error : `${field.name.split('_').join(" ")} must be number`
                    })

                    if(field.required){
                        rule.refine(val => val !== 'undefined', {
                            message : `${field.name.split('_').join(" ")} is required`
                        })
                    }

                    if(field.min){
                        rule = rule.min(field.min, `${field.name.split('_').join(" ")} should be greater than ${field.min}`)
                    }

                    if(field.max){
                        rule = rule.max(field.max , `${field.name.split('_').join(" ")} should be less than ${field.max}`)
                    }
                break;

            case 'select' : 
                    rule = z.string().min(1, `${field.name.split('_').join(" ")} is requried`)
                    if(field.options && field.options.length > 0){
                        rule = rule.refine(val => field.options.some(opt => val === opt), {
                            message : `${field.name.split('_').join(" ")} is invalid`
                        })
                    }
                break;
            
            case 'readOnly' : 
                    rule = z.string().min(1, `${field.name} is required`);
                    rule = z.refine(val => val !== undefined, {
                        message : `${field.name.split("_").join(" ")} is required`
                    })
                     break;

            case 'date' : 
                rule = z
                .string({
                    required_error: `${field.name} is required`,
                    invalid_type_error: `${field.name} is invalid`,
                })
                .min(1, `${field.name} is required`);
                break;
                        
                default:
                break;
        }

        shape[field.name] = rule;
    })

    return z.object(shape)
}

