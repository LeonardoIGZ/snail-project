# 0005. Monorepo with pnpm workspaces and a catalog

- Status: Accepted
- Date: 2026-10-19

## Context

Typescript 7 is now available (Go native version) but ´typescript-eslint´ only admits
Typescript versions under 6.1.0

## Options considered

- Typescript 7 without lint and typos information
- Typescript 6 with full linting

## Decision

- Typescript with full linting in the catalog

## Consequences

Rules such ´no-floating-promises´ wich are important in Express async handlers, are retained.
Native compilator speed is lost. This will be reviewed when typescript-eslint supports Typescript 7
