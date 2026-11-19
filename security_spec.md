# ChibiMon 200 — Firestore Security Specification (Phase 0)

## 1. Data Invariants
1. **Identity Ownership**: Every document at `/users/{userId}` belongs strictly to the Firebase Authentication user whose `request.auth.uid == userId`, with `request.auth.token.email_verified == true`.
2. **No Cross-User Reads or Listing**: Because `/users/{userId}` stores PII (`email`), `allow get` is strictly restricted to the verified owner, and `allow list` is unconditionally denied (`false`).
3. **Immutable Audit & Identity Fields**: `uid` and `createdAt` can never be changed after document creation (`incoming().uid == existing().uid`, `incoming().createdAt == existing().createdAt`).
4. **Server-Enforced Temporal Integrity**: `createdAt` must equal `request.time` on creation, and `updatedAt` must equal `request.time` on both creation and every update.
5. **Monotonic Progression Integrity**: During gameplay progress updates, `highestUnlockedLevel` cannot regress and cannot exceed `levels.size() + 1` (supporting offline-to-cloud catch-up sync while preventing level-skipping without completed level records), and `totalScore` cannot decrease.
6. **Strict Schema & Bounds**: Exactly 10 allowed keys, no shadow/ghost fields (`hasAll` + `hasOnly`), bounded string lengths, integer ranges (`1..200`, `0..500000000`), and `levels` map capped at 200 entries.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return PERMISSION_DENIED)
1. **Unauthenticated Read/Write**: `request.auth == null` reading or writing `/users/user_abc`.
2. **Unverified Email Spoof**: `request.auth != null` with `request.auth.token.email_verified == false` writing `/users/user_abc`.
3. **Cross-Tenant Read**: User A (`uid: "userA"`) calling `get` on `/users/userB`.
4. **Collection Scraping (`list`)**: Any authenticated user querying `collection(db, "users")`.
5. **UID Spoofing in Body**: User A creating `/users/userA` with body `uid: "userB"`.
6. **Shadow / Ghost Field Injection**: User A adding `"isAdmin": true` or `"role": "admin"` in create or update.
7. **Client-Spoofed Timestamp**: Sending a hardcoded `createdAt` or `updatedAt` that does not equal `request.time`.
8. **Immutable Field Tampering**: Updating `createdAt` or `uid` after creation.
9. **Level Progression Shortcutting**: Updating `highestUnlockedLevel` from `1` directly to `200`.
10. **Type Poisoning**: Updating `totalScore` with a string `"999999"` or `levels` with an array `[]`.
11. **Denial-of-Wallet String/Map Bloat**: Passing a 2,000-character `displayName` or `photoURL`, or `levels` map with > 200 keys.
12. **Document ID Poisoning**: Attempting to write to `/users/bad$id!with*invalid^chars`.
