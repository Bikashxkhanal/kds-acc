# Demo data and staff phone index

Dummy records are created only in a separate database whose name contains `dummy`, `demo`, or `sandbox`. They are marked with `isDummy: true`; both seed commands reject production environments and do not fall back to `bs/.env`'s live database URI.

1. Copy `.env.demo.example` to `.env.demo` in `bs/`.
2. Set `DUMMY_SEED_ENABLED=true`, provide a MongoDB URI for a separate demo database, and set `DUMMY_DB_NAME` to that database name (for example, `kds_demo`). Do not use the URI for the production database.
3. Run `cd bs && npm run seed`. Re-running first clears only `isDummy: true` records in that demo database, then recreates the sample dataset.
4. Run `cd bs && npm run seed:clear` to remove only those marked records.

The sample includes a demo login, 18 customers, 9 staff, 90 days plus one aged sale, 24 purchases, customer and staff payments, and 6 invoices. After seeding, sign in with phone `9899990000` and password `DemoOnly2026!`. These credentials are for the isolated demo database only. Sequence counters are left intact, so clearing does not reuse IDs.

Before deploying the staff phone uniqueness constraint, run `cd bs && npm run migrate:staff-phone-index`. The migration checks staff records for duplicate phone numbers and stops without changing indexes if it finds any. Resolve duplicates, then rerun it. Archived staff retain their phone number for uniqueness and audit history.
