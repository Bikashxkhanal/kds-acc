-- Allow records to omit a quantity unit. Existing values are preserved.
ALTER TABLE customer_work_details_tbh
    MODIFY COLUMN quantity_unit_notation VARCHAR(10) NULL;

ALTER TABLE bill_info
    MODIFY COLUMN quantity_unit_notation VARCHAR(10) NULL;
