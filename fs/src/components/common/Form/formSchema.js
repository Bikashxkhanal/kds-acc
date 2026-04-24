import {preprocess, z} from 'zod'

export const formSchema = (fields = []) => {
    const shape = {}
    console.log(fields);
    
    fields?.forEach((field) => {
        let rule ;
        switch (field.type) {
            case 'text':
            case 'tel':
                    rule = z.preprocess(val => val === undefined || val === null ? "" : val, z.string({required_error : `${field.name.split('_').join(" ")} is required`}).min(1, `${field.name.split('_').join(" ")} is required`))
                    
                    if(field.min){
                      rule =  rule.min(field.min, `${field.name.split('_').join(" ")} must be atleast ${field.min}`)
                    }
                    if(field.max){
                     rule =   rule.max(field.max, `${field.name.split('_').join(" ")} cannot exceed ${field.max}`)
                    }
                break;

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
            
        
            default:
                break;
        }

        shape[field.name] = rule;
    })

    return z.object(shape)
}

