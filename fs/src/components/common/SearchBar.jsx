// import { useState, useEffect, useRef, useCallback } from "react";

// const SearchBar = ({
//         placeholder = "Search customer by name",
//         queryFn, //for suggestion showing 
//         delay = 500,
//         searchedData, //must pass to parent
//         className = '',
//         onSelectQueryFn //calling the db for fetching the data when the actual suggetion is suggested

// }) => {

//     const [searchQuery, setSearchQuery] = useState('');
//     const [debouncedQuery, setDebouncedQuery] = useState('');
//     const [suggetedData, setSuggestedData] = useState([]) ;
//     const [activeIdx, setActiveIdx] = useState(-1) 
//     const [isOpen, setIsOpen] = useState(false);
  

//     const containerRef = useRef(null);

//     useEffect(() => {
       
//             const timer = setTimeout(() => {
//                     setDebouncedQuery(searchQuery);
//             }, delay);

//             return () => clearTimeout(timer)
//     }, [searchQuery])

//     useEffect(() => {
//         const handleClickOutside = (e) => {
//                 if(containerRef.current && !containerRef.current.contains(e.target)){
//                         setActiveIdx(-1);
//                         setIsOpen(false)
//                 }

//                 document.addEventListener('mousedown', handleClickOutside)
            
//         return () =>  document.removeEventListener('mousedown', handleClickOutside);
        
//         }
//     }, [])

//     const hanldleKeyDown = useCallback((e) => {
//         if(!isOpen || suggetedData.length == 0)  return;

//         if(e.key === 'ArrowDown'){
//             e.preventDefault();
//             setActiveIdx(prev => (prev+1) % suggetedData.length)
//         }else if(e.key === 'ArrowUp'){
//             e.preventDefault();
//             setActiveIdx(prev => (prev -1) % suggetedData.length)
//         }else if(e.key === 'Escape'){
//             e.preventDefault();
//             setIsOpen(false);
//             setActiveIdx(-1)
//         }else if(e.key === 'Enter' && activeIdx.length > 0){
//             e.preventDefault();
//             handleSelect(suggetedData[activeIdx])
            
//         }
        
//     }, [isOpen, suggetedData, activeIdx])

//     const handleSelect = async (data) => {
//     //    console.log(data)
//        setSearchQuery(data?.value)

//         try {
//             const res = await onSelectQueryFn({
//                 params : {q : data?.value}
//             });

//             console.log(res);
            
//         } catch (error) {
//             console.log(error);
            
//         }
//     }

    

//     useEffect(() => {
//         const controller = new AbortController()

//         const fetchData = async(queryFn) => {
//              if(!debouncedQuery?.trim()) return
//             try {
//                 // console.log(debouncedQuery);
                
//                 const res = await queryFn( {params : {q : debouncedQuery}, 
//                  signal :  controller.signal } 
//                 );
//                 setSuggestedData(res?.data)
//                 setIsOpen(true)
//                 searchedData(res?.data)
                
//             } catch (error) {
//                 if(error.name === 'CanceledError'){
//                     console.log("request cancelled");
                    
//                 }else {
//                     console.log(error);
                    
//                 }
//             }

//         }

//         if(debouncedQuery) fetchData(queryFn)

//         return () => controller.abort()
//     }, [debouncedQuery])

//     return <div ref={containerRef} className="flex flex-col justify-center ">
//                 <input type="text"
//                 onKeyDown={hanldleKeyDown}
//                 placeholder={placeholder}
//                 className={`outline-none bg-white w-70 md:w-100 h-10 px-3 py-2 border border-white rounded-4xl shadow-sm ${className}`}
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//                 {
//                    (isOpen && suggetedData?.length > 0 )&& (
//                          <div className="bg-white px-2 py-2 md:px-4 md:py-4 mt-0 md:mt-0 border border-gray-200 rounded-lg shadow-xl">
//                             {suggetedData?.map((data, index) => <li 
//                             className={`list-none ${activeIdx === index
//                                  ? 'bg-blue-200 text-blue-700'
//                                 : 'hover:bg-gray-50'
//                             }`}
//                              key={data?.id}
//                              onMouseDown={() => handleSelect(data)}
//                              >{data?.name}</li>)}
//                         </div>
//                     )
//                 }
               

//             </div> 
// }


// export default SearchBar;; 

import { useState, useEffect, useCallback, useRef } from "react"

const SearchBar = ({
        minChars = 1,
        delay = 500, //ms
        searchQueryFn, 
        onSelect,
        className, 
        placeholder = "Search..."
}) => {

    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [query, setQuery] = useState('');
    const [activeIndex, setActiveIndex] = useState(-1);
    const [searchQuery, setSearchQuery] = useState('')

    const containerRef = useRef(null);
    const debounceTimer = useRef(null);

     //close dropdown on outside click 
    useEffect(() => {
     const handleClickOutside = () => {  
         if(containerRef.current && !containerRef.current.contains(e.target)){
                setActiveIndex(-1);
                setIsOpen(false)
        }
    }

        document.addEventListener('onMouseDown',handleClickOutside )
        return () => document.removeEventListener('onMouseDown', handleClickOutside);

    }, [])

    //cleanup of debouning in unmount
    useEffect(() => {
        return () => {
            if(debounceTimer.current) clearTimeout(debounceTimer.current)
        }
    }, [])



    //debouncing search query
    const debounceSearch = useCallback((value) => {
       if(debounceTimer.current) clearTimeout(debounceTimer.current)

        if(!value || value?.trim().length < minChars){
                setSearchQuery(() => '')
                setIsOpen(false)
                return
        }

        debounceTimer.current = setTimeout(() => {
            setIsOpen(true)
            setSearchQuery(value)
        }, delay);

    }, [delay, query, minChars])

     //if the input value changes
    const handleChange = useCallback((e) => {
        const  value = e.target.value
        setQuery(value)
        debounceSearch(value)

    }, [debounceSearch]) 

    //aborthing api calls
    useEffect( () => {
        const controller = new AbortController()

        const suggestionsSrch = async() => {
        try {
            const response = await searchQueryFn({
                params : {q : searchQuery}, 
                signal : controller.signal
            })
            setSuggestions(response?.data)
        } catch (error) {
            console.log(error);
            
        }

    }
      if(searchQuery)  suggestionsSrch();

    return () => controller.abort()
    }, [searchQuery, searchQueryFn])

    //handling the arrow key up down enter and escape
    const handleKeyDown = useCallback((e) => {
       if(!isOpen || suggestions.length === 0) return;

       if(e.key === 'ArrowUp'){
            e.preventDefault()
            setActiveIndex( prev => (prev -1) % suggestions.length)
                console.log(activeIndex);
                
       }else if(e.key === 'ArrowDown'){
           e.preventDefault()
            setActiveIndex(prev => (prev +1) % suggestions.length)
       }else if(e.key === 'Escape'){
        setActiveIndex(-1)
        setIsOpen(false)
       }else if(e.key === 'Enter' && activeIndex >= 0){
        e.preventDefault()
        setIsOpen(false);
        setActiveIndex(-1)
            handleSelect(suggestions[activeIndex])
       }

    }, [suggestions , isOpen, activeIndex ])

    const handleSelect = useCallback((item) => {
            setQuery(item?.name)
            setIsOpen(false)
            setActiveIndex(-1)
            onSelect?.(item)
    }, [onSelect])

   

    return (
        <div ref={containerRef} className="flex flex-col justify-center " >
            <input type="text" 
            className={`outline-none bg-white w-70 md:w-100 h-10 px-3 py-2 border border-white rounded-4xl shadow-sm ${className}`}
                placeholder={placeholder}
                onChange={handleChange}
                value={query}
                onKeyDown={ handleKeyDown}

            />
            {
                isOpen && (
                    <ul className="bg-white px-2 py-2 md:px-4 md:py-4 mt-0 md:mt-0 border border-gray-200 rounded-lg shadow-xl">
                        {
                            suggestions.length > 0 ? (
                                suggestions.map((suggestion, idx) => (
                                    <li
                                     className={`list-none ${activeIndex === idx
                                        ? 'bg-blue-200 text-blue-700'
                                        : 'hover:bg-gray-50'
                                        }`}
                                     onMouseDown={() => handleSelect(suggestion)} key={idx} > {suggestion?.name} </li>
                                )) 
                            ):  <li> No match found </li>
                        }
                    </ul>
                )
            }
        </div>
    )


}


export default SearchBar