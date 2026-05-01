import { useEffect, useState } from "react";

const Table = ({
  tableData = [],
  className = ''
}) => {
  
  if(tableData.length ==0) return;
     const tableHeader = Object.keys(tableData?.[0]);
    const tableBody = tableData?.map((data) => Object.values(data));

  return (
    <div className="overflow-hidden rounded-t-xl w-[90%]">
      <table className={`w-full border-separate border-spacing-0 ${className}`}>
        
        {/* HEADER */}
        <thead className="bg-purple-400 ">
          <tr>
            {
              tableHeader?.map((header, index, arr) => (
                <th
                  key={header}
                  className={`
                    px-5 py-4 border border-purple-400
                    ${index === 0 ? "rounded-tl-sm" : ""}
                    ${index === arr.length - 1 ? "rounded-tr-sm" : ""}
                  `}
                >
                  {header}
                </th>
              ))
            }
          </tr>
        </thead>

        {/* BODY */}
        <tbody>
          {
            tableBody?.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {
                  row?.map((cell, colIndex) => (
                    <td
                      key={colIndex}
                      className="px-5 py-4 border border-gray-200"
                    >
                      {cell}
                    </td>
                  ))
                }
              </tr>
            ))
          }
        </tbody>

      </table>
    </div>
  );
};

export default Table;