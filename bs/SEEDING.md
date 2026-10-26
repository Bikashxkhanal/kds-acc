# Demo data and staff phone index

Dummy records are created only in a separate database whose name contains `dummy`, `demo`, or `sandbox`. They are marked with `isDummy: true`; both seed commands reject production environments and do not fall back to `bs/.env`'s live database URI.

1. Copy `.env.demo.example` to `.env.demo` in `bs/`.
2. Set `DUMMY_SEED_ENABLED=true`, provide a MongoDB URI for a separate demo database, and set `DUMMY_DB_NAME` to that database name (for example, `kds_demo`). Do not use the URI for the production database.
3. Run `cd bs && npm run seed`. Re-running first clears only `isDummy: true` records in that demo database, then recreates the sample dataset.
4. Run `cd bs && npm run seed:clear` to remove only those marked records.

The sample includes Admin and Operator demo logins, 18 customers, 9 staff, 90 days plus one aged sale, 24 purchases, customer and staff payments, 6 invoices, and sample activity logs. The seed prints both demo credentials only outside production. They are for the isolated demo database only. Sequence counters are left intact, so clearing does not reuse IDs.

## Database migrations and system users

For the configured MongoDB database, run the idempotent migrations from `bs/`:

```sh
npm run migrate:customer-type
npm run migrate:sales-titles
npm run migrate:staff-phone-index
npm run migrate:activity-log
ADMIN_USER_IDENTIFIER=<existing-email-or-phone> npm run migrate:roles
```

`ADMIN_USER_IDENTIFIER` is optional. If omitted, the role migration preserves an existing Admin or promotes the lowest-ID existing user, then sets other users to Operator. An unknown identifier causes the migration to stop before changing roles.

To create a system user interactively, run `npm run user:create`. Enter the name, 10-digit phone number, role (`admin` or `operator`), then the password (input is hidden). The script hashes the password, requires a strong password, assigns a placeholder email because the current schema requires one, and forces a password change at first login. It refuses to create an Operator if no active Admin exists.

Before deploying the staff phone uniqueness constraint, run `cd bs && npm run migrate:staff-phone-index`. The migration checks staff records for duplicate phone numbers and stops without changing indexes if it finds any. Resolve duplicates, then rerun it. Archived staff retain their phone number for uniqueness and audit history.
