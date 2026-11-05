# 0003. Drizzle as the ORM

- Status: Accepted
- Date: 2026-10-19

## Context

The API requires typed access to PostgreSql with versioned migrations

## Options considered

- Direct SQL with a driver (full control, no types)
- Prisma (popular, more asbtraction, it's own schema language)
- Drizzle (The schema is defined in Typescript and queries resemble SQL)

## Decision

- Drizzle

## Consequences

Typed queries without straying from SQL, PostgreSql transactions and constraints (such as CHECK) remain explicit, wich is important for performance. On the other hand, Drizzle has a smaller ecosystem than Prisma
