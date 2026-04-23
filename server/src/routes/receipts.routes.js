import { Router } from "express";
import {
  handleList,
  handleGet,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleListUnpaidInvoices
} from "../controllers/receipts.controller.js";

const router = Router();

router.get("/", handleList);                        -- handleList
router.get("/unpaid-invoices", handleListUnpaidInvoices);         -- handleListUnpaidInvoices
router.get("/:receiptNo", handleGet);           -- receiptNo, handleGet
router.post("/", handleCreate);                       -- handleCreate
router.put("/:receiptNo", handleUpdate);           -- receiptNo, handleUpdate
router.delete("/:receiptNo", handleDelete);        -- receiptNo, handleDelete

export default router;