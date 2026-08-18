# Database tests

Plain psql suites that assert the security and onboarding behaviour of the
schema. They run against the local stack and print one PASS or FAIL line per
check, so a failure names the rule that broke rather than a line number.

```bash
pnpm db:test
```

That resets the local database first, so every run starts from the migrations
plus `seed.sql` and nothing leaks between runs.

| File | Covers |
|---|---|
| `access-control.sql` | Column-level grants, the protected-column guard, and the audited admin functions from `202608180001` |
| `auth-prerequisites.sql` | The signup trigger, derived profile state, email confirmation sync, and storage policies from `202608190001` |

## Writing more

Switch roles **inside** a `do $$ ... $$` block:

```sql
execute 'set local role authenticated';
perform set_config('request.jwt.claims',
  json_build_object('sub', some_uuid, 'role', 'authenticated')::text, true);
```

`SET LOCAL` outside an explicit transaction is a no-op in psql. Statements then
run as `postgres`, and a superuser bypasses RLS entirely, so every policy looks
like it is missing and the test passes when it should fail.
