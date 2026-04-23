import { Router } from "express";
import { handleReceiptList, handleInvoiceReceiptReport } from "../controllers/receiptReports.controller.js";
  -- handleReceiptList, handleInvoiceReceiptReport

const router = Router();
router.get("/receipt-list", handleReceiptList);       -- handleReceiptList
router.get("/invoice-receipt", handleInvoiceReceiptReport);    -- handleInvoiceReceiptReport

export default router;