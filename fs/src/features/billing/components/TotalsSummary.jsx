import { formatCurrency } from "../../../utils/currency";
import { amountToWords } from "../../../utils/numberToWords";
import { InputBox } from "../../../components";
import { TAX_RATE_OPTIONS } from "../../../utils/invoiceCalculations";

const TotalsSummary = ({ totals = {}, paidAmount, onPaidAmountChange, taxRate, onTaxRateChange }) => {
  const rows = [
    { label: "Subtotal", value: totals.subtotal },
    { label: "Discount", value: totals.discount },
    { label: "Taxable Amount", value: totals.taxableAmount },
    { label: `Tax Amount (${totals.taxRate || 0}%)`, value: totals.tax },
    { label: "Grand Total", value: totals.grandTotal, highlight: true }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-50 rounded-lg p-4 space-y-2">
        {rows.map(({ label, value, highlight }) => (
          <div key={label} className={`flex justify-between text-sm ${highlight ? "font-bold text-[#12355b] border-t border-slate-200 pt-2" : ""}`}>
            <span className="text-slate-600">{label}</span>
            <span>{formatCurrency(value || 0)}</span>
          </div>
        ))}
      </div>

      <div><label className="kds-label">Tax Rate</label><select className="kds-input" value={taxRate} onChange={(event) => onTaxRateChange?.(event.target.value)}>{TAX_RATE_OPTIONS.map((rate) => <option key={rate} value={rate}>{rate}%</option>)}</select></div>

      <InputBox
        label="Paid Amount"
        type="number"
        min="0"
        step="0.01"
        icon="bi-cash"
        value={paidAmount}
        onChange={(e) => onPaidAmountChange?.(e.target.value)}
      />

      <div className="flex justify-between text-sm font-medium">
        <span className="text-slate-600">Remaining Amount</span>
        <span className="text-orange-600">{formatCurrency(totals.remainingAmount || 0)}</span>
      </div>

      <p className="text-xs text-slate-500 italic leading-relaxed">
        {amountToWords(totals.grandTotal || 0)}
      </p>
    </div>
  );
};

export default TotalsSummary;
