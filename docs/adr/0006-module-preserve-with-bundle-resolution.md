# 0006. Module resolution: Preserve with Bundler

- Status: Accepted
- Date: 2026-10-19

## Context

Packages in the monorepo import `packege\contracts` as Typescript code, without a compilation step.
With NodeNext relative imports require the `js` extension, and an internal Typescript
package cannot be run directly with Node.

## Options considered

- NodeNext with contracts compiled to dist
- Preseve + Bundler, with tsx in develpment and a bundler in production

## Decision

- module: “Preserve” and moduleResolution: “Bundler” in tsconfig.base.json.

## Consequences

Imports without file extensions and a single configuration for both the API and the web; changes to contracts are reflected instantly. However, the API cannot be run directly with Node.js: it requires TSX for development and a bundler (such as tsup) for production.
