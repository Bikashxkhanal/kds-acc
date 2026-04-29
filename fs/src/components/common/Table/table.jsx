const Table = ({
  tableData = {},
  className = ''
}) => {
  return (
    <div className="overflow-hidden rounded-t-xl w-[90%]">
      <table className={`w-full border-separate border-spacing-0 ${className}`}>
        
        {/* HEADER */}
        <thead className="bg-purple-400 ">
          <tr>
            {
              tableData?.tableHeader?.map((header, index, arr) => (
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
            tableData?.tableBody?.map((row, rowIndex) => (
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