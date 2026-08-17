# BORO Locked Product Decisions

These decisions come from the source documents in:

```text
C:\Users\yukta\OneDrive\Bureau\RENTAL SITE\docs
```

## Brand

- Public platform name: BORO

## Roles

| English | French | Creole | Internal |
|---|---|---|---|
| Renter | Locataire | Lokater | `renter` |
| Owner | Propriétaire | Propriyeter | `owner` |
| Admin | Opérateur | Operater | `admin` |

Implementation must use Owner, not Borrower.

## Phase 1 Access Flow

```text
Signup
-> Choose email/password or Google
-> Choose role intent: Renter, Owner, or both
-> Accept Terms and Privacy Policy
-> Email OTP if email/password
-> Mandatory profile setup
-> ID verification status
-> Limited or full role-based homepage
```

```text
Login
-> Authenticate existing account
-> Check email verification
-> Check profile completion
-> Check ID verification
-> Check role
-> Route to Renter, Owner, Admin, or last-used dual-role homepage
```

## Environment Decision

- Local: Supabase CLI with Docker.
- Staging / preprod: separate Supabase project first.
- Production: separate Supabase project.
- Supabase branching: later, when BORO has PR preview environments.

## Production Email Decision

Production email provider will be selected after the BORO domain is confirmed and purchased.
