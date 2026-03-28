import React from "react";
import DataList from "../../components/DataList";
import { listPayments } from "../../api/payments.api.js";

export default function PaymentList(){
    const fetchData = React.useCallback((params) => listPayments(params), []);
    
    const columns = [
        { key: "id", label: "Payment No" },
        { key: "payment_date", label: "Date" }, // Matches your SQL 'payment_date'
        { key: "invoice_id", label: "Invoice ID" },
        { key: "amount", label: "Amount" }
    ];

    return (
        <DataList
            title = "Payments"
            fetchData={fetchData}
            columns={columns}
            itemName="payment"
            emptySearch="No payments found."
            emptyDefault="No payments yet."
            
        />
    );
}