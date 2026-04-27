import {preprocess, z} from 'zod'
import NepaliDate from 'nepali-date-converter'

export const formSchema = (fields = []) => {
    const shape = {}
    console.log(fields);
    
    fields?.forEach((field) => {
        let rule ;
        switch (field.type) {
            case 'text':
            case 'tel': {
                let stringSchema = z.string({
                    required_error: `${field.name.split('_').join(" ")} is required`,
                    invalid_type_error: `${field.name.split('_').join(" ")} must be a string`
                }).min(1, `${field.name.split('_').join(" ")} is required`);

                if (field.min) {
                    stringSchema = stringSchema.min(
                    field.min,
                    `${field.name.split('_').join(" ")} must be at least ${field.min}`
                    );
                }

                if (field.max) {
                    stringSchema = stringSchema.max(
                    field.max,
                    `${field.name.split('_').join(" ")} cannot exceed ${field.max}`
                    );
                }

                rule = z.preprocess(
                    (val) => (typeof val === "string" ? val.trim() : val),
                    stringSchema
                );

                break;
                }

            case 'number' : 
                    rule = z.number({
                        required_error : `${field.name.split('_').join(" ")} is required`,
                        invalid_type_error : `${field.name.split('_').join(" ")} must be number`
                    })

                    if(field.required){
                        rule.refine(val => val !== 'undefined', {
                            message : `${field.name.split('_').join(" ")} is required`
                        })
                    }

                    if(rule.min){
                        rule = rule.min(field.min, `${field.name.split('_').join(" ")} should be greater than ${field.min}`)
                    }

                    if(rule.max){
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
                    rule = z.preprocess(val => {
                        if(!val) return undefined;
                        return new NepaliDate(val);
                    }, z.date(
                        {
                            required_error : `${field.name} is required`,
                            invalid_type_error : `${field.name} is required` 
                        }
                    ) )
            
        
            default:
                break;
        }

        shape[field.name] = rule;
    })

    return z.object(shape)
}

