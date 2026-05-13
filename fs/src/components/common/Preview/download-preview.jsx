import { useEffect, useRef } from "react";
import Button from "../button";
const DownloadPreview = (
    {
        title = "REPORT",
        data = {metaData : null, tableData : null},
        handleClickOut,
        handleClick
    }
) => {
    
    const containerRef = useRef(null)
    
    const metaData = data?.metaData ? Object.entries(data?.metaData) :  [];
    // console.log(metaData);

    const tableHeaders = data?.tableData.length > 0 ? Object.keys(data?.tableData?.[0]) : [];
    const tableData =data?.tableData.length > 0 ? data?.tableData : []
    // console.log(tableData);
    
   useEffect(() => {
        const handleClickOutside = (e) => {
            // console.log(e.target);
            
            if(containerRef.current && !containerRef.current.contains(e.target)){
                    handleClickOut?.()
            }
        }

        document.addEventListener('mousedown',handleClickOutside )
        return () => document.removeEventListener('mousedown', handleClickOutside);
   } , [])

    return (
       <div ref={containerRef} className="w-[70%] h-[95%] absolute top-0 z-10 bg-white " >
           <div className="px-5 py-3 h-[90%] overflow-scroll" >
            {/* personal details */}
            <div className="" >
               <div className="text-center py-5">
                 <h3>KHANAL DHUWANI SEWA</h3>
                <h6>Dudhauli-8, Sindhuli</h6>
               </div>
               <div className="text-center text-2xl mb-5">
                    <span>{title}</span>
               </div>
                {
                    metaData?.map((pair, idx) => (
                    <div className="w-full py-1 flex flex-row flex-start gap-5" >
                      {
                            pair?.map((data, index) => (
                                
                            <span key={index}> 
                            {
                            typeof data === 'string' ? 
                                    data?.split("_").join(" ").toUpperCase() 
                                    : data 
                            }
                            </span>
                            ))
                        }
                    </div>
                       
                    )
                   
                )
                }
            </div>
            {/* full details  */}
            <div>
               {
                tableData.length > 0 ? (
                    <table className="w-full">
                        <thead>
                            <tr>
                            {
                                tableHeaders.map((head, index) => (
                                    <td key={index} className="text-center" >
                                        {head?.toUpperCase()}
                                    </td>
                                ))
                            }
                            </tr>
                        </thead>
                        <tbody className="">
                            {
                                //tabledata used for just iterating, we need to iterate to the number of rows(if data row length is 5 , then iteration should be 5)
                                tableData?.map((td, idx) => (
                                    <tr key={idx} className="text-center" >
                                    {tableHeaders?.map((key, index) => (       
                                                <td key={key}>
                                                    { key === 'date' ? td[key]?.split("T")?.[0] : td[key] }
                                                </td>
                                            
                                ))}
                                </tr>
                                ))
                                
                            }
                        </tbody>

                    </table>
                ) : (
                    <p className="text-center" > No data found </p>
                )

               }

            </div>
           </div>
           <div className="text-center">
             <Button children="Download" varient={'confirmation'} onClick={() => handleClick()} />
           </div>
           

       </div>
    )
}

export default DownloadPreview;