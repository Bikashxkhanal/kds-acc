import { useState, useEffect } from "react";
import InputBox from "./InputBox";
import { searchCustomer } from "../../services/customer/customer.js";


const SearchBar = ({
        placeholder = "Search customer by name",
        fn,
        delay,
        searchedData,
        className

}) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
       
            const timer = setTimeout(() => {
                    setDebouncedQuery(searchQuery);
            }, delay);

            return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        const controller = new AbortController()

        const fetchData = async(fn) => {
             if(!debouncedQuery?.trim()) return
            try {
                console.log(debouncedQuery);
                
                const res = await fn( {params : {q : debouncedQuery}, 
                 signal :  controller.signal } 
                );
                searchedData(res?.data)
                
            } catch (error) {
                if(error.name === 'CanceledError'){
                    console.log("request cancelled");
                    
                }else {
                    console.log(error);
                    
                }
            }

        }

        if(debouncedQuery) fetchData(fn)

        return () => controller.abort()
    }, [debouncedQuery])

    return <input type="text"
                placeholder={placeholder}
                className={`outline-none bg-white w-100 h-10 px-3 py-2 border border-white rounded-4xl shadow-xl ${className}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
}


export default SearchBar;; 