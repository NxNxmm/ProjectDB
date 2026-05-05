\set ON_ERROR_STOP on

CREATE TABLE IF NOT EXISTS receipt (
  id               bigint primary key,
  created_at       timestamptz not null default now(),
  receipt_no       text unique not null,            
  receipt_date     date not null,            
  customer_id      bigint not null references customer(id), 
  payment_method   text not null default 'cash',     
  payment_notes    text,                             
  total_received   numeric(14,2) not null default 0.00 
);

CREATE TABLE IF NOT EXISTS receipt_line_item (
  id               bigint primary key,
  created_at       timestamptz not null default now(),
  receipt_id       bigint not null references receipt(id) on delete cascade,
  invoice_id       bigint not null references invoice(id),
  amount_received  numeric(14,2) not null default 0.00          
);

CREATE OR REPLACE VIEW invoice_received_view AS
SELECT
  c.id AS customer_id,
  i.id AS invoice_id,
  i.invoice_no,                                           
  i.amount_due,                                               
  COALESCE(SUM(rli.amount_received), 0) AS amount_received,
  i.amount_due - COALESCE(SUM(rli.amount_received), 0) AS amount_remain
FROM invoice i
JOIN customer c ON c.id = i.customer_id                          
LEFT JOIN receipt_line_item rli ON rli.invoice_id = i.id
GROUP BY c.id, i.id, i.invoice_no, i.amount_due;

INSERT INTO receipt (id, receipt_no, receipt_date, customer_id, payment_method, payment_notes, total_received)
VALUES 
(28, 'RCT26-00028', '2026-05-05', 1, 'bank transfer', NULL, 301520.81),
(10, 'RCT26-00010', '2026-01-12', 1, 'cash', 'First partial payment', 300.00),
(21, 'RCT26-00021', '2026-02-13', 1, 'bank transfer', NULL, 1700.00),
(24, 'RCT26-00024', '2026-02-15', 1, 'check', NULL, 500.00),
(27, 'RCT26-00027', '2026-02-17', 1, 'cash', NULL, 1500.00);

INSERT INTO receipt_line_item (id, receipt_id, invoice_id, amount_received)
VALUES 
(101, 10, 2, 300.00),
(102, 21, 2, 700.00), 
(103, 21, 4, 1000.00),
(104, 24, 4, 500.00),
(105, 27, 5, 1500.00);

SELECT setval(pg_get_serial_sequence('receipt', 'id'), coalesce(max(id), 0) + 1, false) FROM receipt;
SELECT setval(pg_get_serial_sequence('receipt_line_item', 'id'), coalesce(max(id), 0) + 1, false) FROM receipt_line_item;