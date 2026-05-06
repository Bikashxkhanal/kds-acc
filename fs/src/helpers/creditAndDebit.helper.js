//it gives the final values after subtracting debited or adding credited value to show in the a/c statement of the customer
function getFinalCreditOrDebitValue(data){
            const values = []
            for (let i = 0; i< data.length ; i++){
                let sum = 0;
            for(let j = i ; j < data.length; j++){
                    sum += data[j].Credit - data[j].Debit
            } 
            values.push(sum);
            }
            return values
        }

export {
    getFinalCreditOrDebitValue
}