# 0002. JWT access tokens with rotating refresh tokens

- Status: Accepted
- Date: 2026-10-19

## Context
The API need to authenticate Web requests

## Options considered
- Database session with httpOnly cookie (simple and instantly revocable)
- JWT for access with a rotating refresh token

## Decision
A 15-minute access JWT, stored only in memory on the front end an opaque refresh token in an httpOnly, 
Secure, and SameSite=Strict cookie, stored as a hash in the database and rotated with each use

## Consequences
Choosen to follow a very common pattern in APIs. A JWT can't be revoke before it expires, so the short 15 minutes window limits the risk. Rotation with reuse detection (if a previously rotated, refresh token is used, it's entire familiy is revoked) mitigates token theft. In exchange, there are more components involved: a refresh endpoint, a token table, and client-side retry logic. A session cookie would have been the simpliest option.