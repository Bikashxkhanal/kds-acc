import { Button } from "../../../components";
import { UNIT_OPTIONS, calculateLineTotal } from "../../../utils/invoiceCalculations";
import { formatNumber } from "../../../utils/currency";

const LineItemsEditor = ({ items = [], onChange }) => {
  const updateItem = (index, field, value) => {
    const next = items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      updated.total = calculateLineTotal(updated);
      return updated;
    });
    onChange(next);
  };

  const addRow = () => onChange([...items, {
    productName: "", description: "", quantity: 1, unit: "Cubic Meter",
    rate: 0, discount: 0, total: 0
  }]);

  const removeRow = (index) => {
    if (items.length <= 1) return;
    onChange(items.filter((_, i) => i !== index));
  };

  const duplicateRow = (index) => {
    const copy = { ...items[index], total: calculateLineTotal(items[index]) };
    const next = [...items];
    next.splice(index + 1, 0, copy);
    onChange(next);
  };

  const moveRow = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-slate-100">
            <tr>
              {["Product / Service", "Description", "Qty", "Unit", "Rate", "Discount", "Total", "Actions"].map((h) => (
                <th key={h} className="px-2 py-2 text-left text-xs font-semibold text-slate-600 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t border-slate-100">
                <td className="px-1 py-1">
                  <input className="kds-input h-8 text-xs" value={item.productName}
                    placeholder="Product name" onChange={(e) => updateItem(idx, "productName", e.target.value)} />
                </td>
                <td className="px-1 py-1">
                  <input className="kds-input h-8 text-xs" value={item.description}
                    placeholder="Optional" onChange={(e) => updateItem(idx, "description", e.target.value)} />
                </td>
                <td className="px-1 py-1 w-16">
                  <input type="number" min="0" step="0.01" className="kds-input h-8 text-xs"
                    value={item.quantity} onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                </td>
                <td className="px-1 py-1 w-24">
                  <select className="kds-input h-8 text-xs" value={item.unit}
                    onChange={(e) => updateItem(idx, "unit", e.target.value)}>
                    {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </td>
                <td className="px-1 py-1 w-24">
                  <input type="number" min="0" step="0.01" className="kds-input h-8 text-xs"
                    value={item.rate} onChange={(e) => updateItem(idx, "rate", e.target.value)} />
                </td>
                <td className="px-1 py-1 w-20">
                  <input type="number" min="0" step="0.01" className="kds-input h-8 text-xs"
                    value={item.discount} onChange={(e) => updateItem(idx, "discount", e.target.value)} />
                </td>
                <td className="px-2 py-1 text-right font-medium whitespace-nowrap">{formatNumber(item.total || 0)}</td>
                <td className="px-1 py-1">
                  <div className="flex gap-0.5">
                    <button type="button" title="Move up" onClick={() => moveRow(idx, -1)}
                      className="p-1 text-slate-400 hover:text-[#12355b] cursor-pointer"><i className="bi bi-arrow-up" /></button>
                    <button type="button" title="Move down" onClick={() => moveRow(idx, 1)}
                      className="p-1 text-slate-400 hover:text-[#12355b] cursor-pointer"><i className="bi bi-arrow-down" /></button>
                    <button type="button" title="Duplicate" onClick={() => duplicateRow(idx)}
                      className="p-1 text-slate-400 hover:text-sky-600 cursor-pointer"><i className="bi bi-copy" /></button>
                    <button type="button" title="Delete" onClick={() => removeRow(idx)}
                      className="p-1 text-slate-400 hover:text-red-500 cursor-pointer"><i className="bi bi-trash" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button varient="outline" size="sm" onClick={addRow}>
        <i className="bi bi-plus-lg" /> Add Row
      </Button>
    </div>
  );
};

export default LineItemsEditor;
