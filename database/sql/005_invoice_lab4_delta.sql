\set ON_ERROR_STOP on  -- หยุดทันทีถ้า SQL มี error ป้องกัน script รันต่อไปแบบผิดๆ

CREATE TABLE IF NOT EXISTS receipt (
  id               bigint primary key,
  created_at       timestamptz not null default now(),
  receipt_no       text unique not null,              -- เลข RCT26-XXXXX auto-generate โดย service
  receipt_date     date not null,             -- date: วันที่รับเงิน
  customer_id      bigint not null references customer(id),  -- customer: ลูกค้าที่จ่ายเงิน
  payment_method   text not null default 'cash',      -- cash | bank transfer | check
  payment_notes    text,                              -- หมายเหตุการชำระ (optional)
  total_received   numeric(14,2) not null default 0.00  -- ผลรวมของ line items ทุกแถว
);

CREATE TABLE IF NOT EXISTS receipt_line_item (
  id               bigint primary key,
  created_at       timestamptz not null default now(),
  receipt_id       bigint not null references receipt(id) on delete cascade,
  invoice_id       bigint not null references invoice(id),  -- invoice: invoice ที่ถูกชำระ
  amount_received  numeric(14,2) not null default 0.00           -- จำนวนเงินที่รับในใบเสร็จนี้
);

CREATE OR REPLACE VIEW invoice_received_view AS
SELECT
  c.id                                                          AS customer_id,
  i.id                                                          AS invoice_id,
  i.invoice_no,                                                 -- invoice_no
  i.amount_due,                                                 -- amount_due: ยอดรวมทั้งหมดของ invoice
  COALESCE(SUM(rli.amount_received), 0)                            AS amount_received,
  -- SUM รวมเงินจากทุก receipt ที่จ่ายให้ invoice นี้
  -- COALESCE(..., 0) เพราะ LEFT JOIN จะได้ NULL ถ้ายังไม่มีการรับเงินเลย
  i.amount_due - COALESCE(SUM(rli.amount_received), 0)             AS amount_remain
  -- amount_remain = ยอดรวม - รับไปแล้ว = ยังค้างอยู่
FROM invoice i
JOIN customer c ON c.id = i.customer_id                              -- customer_id
LEFT JOIN receipt_line_item rli ON rli.invoice_id = i.id  -- invoice_id, id
-- LEFT JOIN: invoice ที่ยังไม่มี receipt จะได้ rli = NULL แต่ยังโชว์ใน view
GROUP BY c.id, i.id, i.invoice_no, i.amount_due;
-- GROUP BY เพื่อ aggregate SUM ต่อ invoice

-- -- ใบเสร็จที่ 1: RCT26-00010 (จ่าย 300 บาท) - มีหมายเหตุ
-- INSERT INTO receipt (id, receipt_no, receipt_date, customer_id, payment_method, payment_notes, total_received)
-- VALUES (10, 'RCT26-00010', '2026-01-12', 1, 'cash', 'First partial payment', 300.00);

-- -- ใบเสร็จที่ 2: RCT26-00021 (จ่าย 1,700 บาท) - ไม่ระบุหมายเหตุ (ใช้ NULL)
-- INSERT INTO receipt (id, receipt_no, receipt_date, customer_id, payment_method, payment_notes, total_received)
-- VALUES (21, 'RCT26-00021', '2026-02-13', 1, 'bank transfer', NULL, 1700.00);

-- -- ใบเสร็จที่ 3: RCT26-00024 (จ่าย 500 บาท) - ไม่ระบุหมายเหตุ (ใช้ NULL)
-- INSERT INTO receipt (id, receipt_no, receipt_date, customer_id, payment_method, payment_notes, total_received)
-- VALUES (24, 'RCT26-00024', '2026-02-15', 1, 'check', NULL, 500.00);

-- -- ใบเสร็จที่ 4: RCT26-00027 (จ่าย 1,500 บาท) - ไม่ระบุหมายเหตุ (ใช้ NULL)
-- INSERT INTO receipt (id, receipt_no, receipt_date, customer_id, payment_method, payment_notes, total_received)
-- VALUES (27, 'RCT26-00027', '2026-02-17', 1, 'bank transfer', NULL, 1500.00);

-- -- จากใบเสร็จ RCT26-00010: จ่ายให้ INV26-111 จำนวน 300 บาท
-- INSERT INTO receipt_line_item (id, receipt_id, invoice_id, amount_received)
-- VALUES (101, 10, 111, 300.00);

-- -- จากใบเสร็จ RCT26-00021: แบ่งจ่าย 2 ยอด
-- -- 1. จ่ายส่วนที่เหลือให้ INV26-111 อีก 700 บาท (รวมเป็น 1,000 พอดี)
-- INSERT INTO receipt_line_item (id, receipt_id, invoice_id, amount_received)
-- VALUES (102, 21, 111, 700.00);
-- -- 2. จ่ายบางส่วนให้ INV26-113 จำนวน 1,000 บาท
-- INSERT INTO receipt_line_item (id, receipt_id, invoice_id, amount_received)
-- VALUES (103, 21, 113, 1000.00);

-- -- จากใบเสร็จ RCT26-00024: จ่ายเพิ่มให้ INV26-113 อีก 500 บาท (ยอดค้างจะเหลือ 500)
-- INSERT INTO receipt_line_item (id, receipt_id, invoice_id, amount_received)
-- VALUES (104, 24, 113, 500.00);

-- -- จากใบเสร็จ RCT26-00027: จ่ายให้ INV26-114 จำนวน 1,500 บาท
-- INSERT INTO receipt_line_item (id, receipt_id, invoice_id, amount_received)
-- VALUES (105, 27, 114, 1500.00);

-- 1. ล้างข้อมูลเก่าเพื่อความสะอาด
DELETE FROM receipt_line_item;
DELETE FROM receipt;

-- 2. สร้างใบเสร็จ (Receipt Header)
INSERT INTO receipt (id, receipt_no, receipt_date, customer_id, payment_method, payment_notes, total_received)
VALUES 
(10, 'RCT26-00010', '2026-01-12', 1, 'cash', 'First partial payment', 300.00),
(21, 'RCT26-00021', '2026-02-13', 1, 'bank transfer', NULL, 1700.00),
(24, 'RCT26-00024', '2026-02-15', 1, 'check', NULL, 500.00),
(27, 'RCT26-00027', '2026-02-17', 1, 'cash', NULL, 1500.00);

-- 3. สร้างรายละเอียดการจ่ายเงิน (Receipt Line Item) 
-- ใช้ ID: 2, 4, 5 ตามข้อมูลในเครื่องคุณ
INSERT INTO receipt_line_item (id, receipt_id, invoice_id, amount_received)
VALUES 
(101, 10, 2, 300.00),   -- จ่ายให้ INV-001 (รอบ 1)
(102, 21, 2, 700.00),   -- จ่ายให้ INV-001 (รอบ 2 - ครบยอด)
(103, 21, 4, 1000.00),  -- จ่ายให้ INV-003 (รอบ 1)
(104, 24, 4, 500.00),   -- จ่ายให้ INV-003 (รอบ 2)
(105, 27, 5, 1500.00);  -- จ่ายให้ INV-004 (รอบเดียวจบ)

-- 4. อัปเดต Sequence ป้องกัน Error ตอนใช้งานหน้า UI
SELECT setval(pg_get_serial_sequence('receipt', 'id'), coalesce(max(id), 0) + 1, false) FROM receipt;
SELECT setval(pg_get_serial_sequence('receipt_line_item', 'id'), coalesce(max(id), 0) + 1, false) FROM receipt_line_item;