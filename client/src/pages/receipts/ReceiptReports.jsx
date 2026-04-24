import React from "react";
import { toast } from "react-toastify";
import { formatBaht, formatDate } from "../../utils.js";
import { TableLoading } from "../../components/Loading.jsx";
// import ฟังก์ชัน fetch จาก api file ที่สร้างไว้ใน Step 5.5
import { fetchReceiptList, fetchInvoiceReceiptReport } from "../../api/receiptReports.api.js";

// TABS กำหนดว่ามีกี่ tab และ key ต้องตรงกับ conditional render ด้านล่าง
const TABS = [
  { key: "receipt-list", label: "Receipt List" },
  { key: "invoice-receipt", label: "Invoice & Receipt" },
];

// FilterBar: shared component ใช้กับทั้ง 2 report — filters คือ object ของ filter ทั้งหมด
function FilterBar({ filters, onChange, onRun, loading }) {
  return (
    <div className="card" style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Date From</label>
          <input type="date" className="form-control"
            value={filters.date_from || ""}
            onChange={(e) => onChange({ ...filters, date_from: e.target.value })} /> 
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Date To</label>
          <input type="date" className="form-control"
            value={filters.date_to || ""} 
            onChange={(e) => onChange({ ...filters, date_to: e.target.value })} /> 
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Customer Code</label>
          <input type="text" className="form-control" style={{ width: 140 }}
            value={filters.customer_code || ""} 
            onChange={(e) => onChange({ ...filters, customer_code: e.target.value })} 
            placeholder="e.g. C001" />
        </div>
        <button type="button" className="btn btn-primary" onClick={onRun} disabled={loading}> 
          {loading ? "Running..." : "Run Report"}
        </button>
        <button type="button" className="btn btn-outline" onClick={() => onChange({})} disabled={loading}>Reset</button>
      </div>
    </div>
  );
}

// Report 1: แสดง receipt แต่ละใบ พร้อม Grand Total ด้านล่าง
function ReceiptListReport() {
  const [filters, setFilters] = React.useState({});
  const [data, setData] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [hasRun, setHasRun] = React.useState(false);  // ซ่อนตารางไว้จนกว่าจะกด Run ครั้งแรก

  async function run() {
    setLoading(true);
    try {
      const res = await fetchReceiptList({ ...filters, page: 1, limit: 500 });
      setData(res.data || []);
      setTotal(res.total || 0);
      setHasRun(true);
    } catch (e) { toast.error(String(e.message || e)); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} onRun={run} loading={loading} /> 
      {!hasRun ? (
        <div className="card">
          <div className="empty-state"><h4>Set filters and click "Run Report"</h4></div>
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: 12, color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <strong>{total}</strong> records
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Receipt No</th><th>Date</th><th>Customer Code</th><th>Customer Name</th>
                  <th>Payment Method</th><th>Notes</th><th className="text-right">Total Received</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <TableLoading colSpan={7} /> : data.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No receipts found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{row.receipt_no}</td>   -- receipt_no
                    <td>{formatDate(row.receipt_date)}</td>   -- receipt_date
                    <td>{row.customer_code}</td>   -- customer_code
                    <td>{row.customer_name}</td>   -- customer_name
                    <td>{row.payment_method}</td>   -- payment_method
                    <td>{row.payment_notes || "-"}</td>   -- payment_notes
                    <td className="text-right font-bold">{formatBaht(row.total_received)}</td> 
                  </tr>
                ))}
              </tbody>
              {data.length > 0 && (
                <tfoot>
                  <tr>
                    <td colSpan={6} className="text-right font-bold">Grand Total:</td>
                    <td className="text-right font-bold" style={{ color: "var(--primary)" }}>
                      {formatBaht(data.reduce((s, r) => s + Number(r.total_received || 0), 0))} 
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Report 2: แสดง invoice แต่ละใบพร้อมรายการรับเงิน — 1 แถวต่อ 1 receipt ที่จ่ายให้ invoice นั้น
// invoice ที่ยังไม่เคยรับเงินเลยจะโชว์ 1 แถว โดย receipt fields เป็น null (แสดงเป็น "-")
function InvoiceReceiptReport() {
  const [filters, setFilters] = React.useState({});
  const [data, setData] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [hasRun, setHasRun] = React.useState(false);

  async function run() {
    setLoading(true);
    try {
      const res = await fetchInvoiceReceiptReport({ ...filters, page: 1, limit: 500 }); 
      setData(res.data || []); 
      setTotal(res.total || 0); 
      setHasRun(true);
    } catch (e) { toast.error(String(e.message || e)); }
    finally { setLoading(false); }
  }

  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} onRun={run} loading={loading} /> 
      {!hasRun ? (
        <div className="card">
          <div className="empty-state"><h4>Set filters and click "Run Report"</h4></div>
        </div>
      ) : (
        <div className="card">
          <div style={{ marginBottom: 12, color: "var(--text-muted)", fontSize: "0.9rem" }}>
            <strong>{total}</strong> records
          </div>
          <div className="table-container">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>Invoice No</th><th>Invoice Date</th><th>Customer Code</th><th>Customer Name</th>
                  <th className="text-right">Amount Due</th><th className="text-right">Total Received</th>
                  <th className="text-right">Remaining</th>
                  <th>Receipt No</th><th>Receipt Date</th><th className="text-right">Receipt Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <TableLoading colSpan={10} /> : data.length === 0 ? (
                  <tr><td colSpan={10} style={{ textAlign: "center", padding: 32, color: "var(--text-muted)" }}>No records found.</td></tr>
                ) : data.map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{row.invoice_no}</td> 
                    <td>{formatDate(row.invoice_date)}</td>  
                    <td>{row.customer_code}</td>  
                    <td>{row.customer_name}</td> 
                    <td className="text-right">{formatBaht(row.amount_due)}</td> 
                    <td className="text-right">{formatBaht(row.amount_received)}</td> 
                    <td className="text-right font-bold"
                      style={{ color: Number(row.amount_remain) > 0 ? "#ef4444" : "#22c55e" }}> 
                      {formatBaht(row.amount_remain)} 
                    </td>
                    <td>{row.receipt_no || "-"}</td>  
                    <td>{row.receipt_date ? formatDate(row.receipt_date) : "-"}</td> 
                    <td className="text-right">{row.receipt_amount != null ? formatBaht(row.receipt_amount) : "-"}</td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ReceiptReports({ tab: initialTab = "receipt-list" }) {
  const [activeTab, setActiveTab] = React.useState(initialTab);

  React.useEffect(() => { setActiveTab(initialTab); }, [initialTab]); 

  const tabBtnStyle = (key) => ({
    padding: "8px 20px", border: "1px solid var(--border)", borderRadius: "var(--radius-sm)",
    background: activeTab === key ? "var(--primary)" : "white",
    color: activeTab === key ? "white" : "var(--text-main)",
    cursor: "pointer", fontSize: "0.9rem", fontWeight: activeTab === key ? 600 : 400,
  });

  return (
    <div>
      <div className="page-header"><h3 className="page-title">Receipt Reports</h3></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" style={tabBtnStyle(t.key)} onClick={() => setActiveTab(t.key)}> 
            {t.label} 
          </button>
        ))}
      </div>
      {activeTab === "receipt-list" && <ReceiptListReport />} 
      {activeTab === "invoice-receipt" && <InvoiceReceiptReport />} 
    </div>
  );
}