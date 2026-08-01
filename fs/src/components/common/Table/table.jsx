import { humanizeLabel } from "../../../utils/labels";

const Table = ({ tableData = [], className = '' }) => {
  if (tableData.length === 0) {
    return (
      <div className="w-full rounded-xl border border-slate-200 bg-white px-5 py-12 text-center">
        <i className="bi bi-inbox text-3xl text-slate-300 mb-2 block" />
        <p className="text-sm text-slate-500">No data found</p>
      </div>
    );
  }

  const tableHeader = Object.keys(tableData[0]);
  const tableBody = tableData.map((data) => Object.values(data));

  return (
    <div className={`kds-table-scroll w-full overflow-auto rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <table className="w-full text-sm border-collapse">
        <thead className="kds-table-header">
          <tr>
            {tableHeader.map((header) => (
              <th key={header} className="px-4 py-3 text-left font-semibold whitespace-nowrap">
                {humanizeLabel(header)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {tableBody.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-slate-50/80 transition-colors">
              {row.map((cell, colIndex) => (
                <td key={colIndex} className="px-4 py-4 text-slate-700 whitespace-nowrap">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
