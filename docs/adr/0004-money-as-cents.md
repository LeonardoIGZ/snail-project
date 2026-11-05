# 0004. Money stored as integer cents

- Status: Accepted
- Date: 2026-10-19

## Context
the balance changes with each top-up and every bet. Floating-point number accumulate errors i.e (0.1 + 0.2 = 0.30000000000000004)

## Options considered
- Decimals with rounding
- Numeric type in the database with convertion in the app
- Cents

## Decision
All amoutns in cents. They are converted to money only when is displayed.

## Consequences
Accurated sums, and the rule is easy to validate. However, only perform conversion in the interface when reading the form and when displaying amounts