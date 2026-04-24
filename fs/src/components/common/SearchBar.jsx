import { useState, useEffect } from "react";


const SearchBar = ({
        placeholder = "Search customer by name",
        queryFn,
        delay = 500,
        searchedData, //must pass to parent

        className = ''

}) => {

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [suggetedData, setSuggestedData] = useState([])

    useEffect(() => {
       
            const timer = setTimeout(() => {
                    setDebouncedQuery(searchQuery);
            }, delay);

            return () => clearTimeout(timer)
    }, [searchQuery])

    useEffect(() => {
        const controller = new AbortController()

        const fetchData = async(queryFn) => {
             if(!debouncedQuery?.trim()) return
            try {
                console.log(debouncedQuery);
                
                const res = await queryFn( {params : {q : debouncedQuery}, 
                 signal :  controller.signal } 
                );
                setSuggestedData(res?.data)
                searchedData(res?.data)
                
            } catch (error) {
                if(error.name === 'CanceledError'){
                    console.log("request cancelled");
                    
                }else {
                    console.log(error);
                    
                }
            }

        }

        if(debouncedQuery) fetchData(queryFn)

        return () => controller.abort()
    }, [debouncedQuery])

    return <div className="flex flex-col justify-center ">
                <input type="text"
                placeholder={placeholder}
                className={`outline-none bg-white w-70 md:w-100 h-10 px-3 py-2 border border-white rounded-4xl shadow-sm ${className}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
                {
                    suggetedData?.length > 0 && (
                         <div className="bg-white px-2 py-2 md:px-4 md:py-4 mt-0 md:mt-0 border border-gray-200 rounded-lg shadow-xl">
                            {suggetedData?.map((data) => <li className="list-none" key={data?.id}>{data?.name}</li>)}
                        </div>
                    )
                }
               

            </div> 
}


export default SearchBar;; 