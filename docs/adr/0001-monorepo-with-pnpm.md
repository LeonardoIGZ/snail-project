# 0001. Monorepo with pnpm workspaces and a catalog

- Status: Accepted
- Date: 2026-10-19

## Context
This project has three applications that shares schemas and tools.

## Options considered
- separated repositories (more insolation, but sharing code requires publishing packages)
- monorepo with npm/yarn workspaces
- mono repositorie with pnpm

## Decision
- mono repositoriees with pnpm workspace, packages/contracts as internal package and 
a version catalog in pnpm-workspace.yaml

## Consequences
A single lockfile and single CI. Catalog guarantees one version per shared dependency.
pnpm insolates the ´node_modules´ of each package (no phantom dependiencies) and block
unapproved installation scripts using ´minimumRelaseAge´ against newly published packages
In return, each dependency must be declared in package that uses it, and contributors need
pnpm