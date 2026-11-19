/**
 * Phase 0 Payload-First Security Test Specification for ChibiMon 200
 * Validates the "Dirty Dozen" adversarial payloads against the exact invariants
 * enforced in firestore.rules and firebase-blueprint.json.
 */

export interface MockAuthContext {
  uid: string;
  emailVerified: boolean;
}

export interface DirtyDozenCase {
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  targetUserId: string;
  auth: MockAuthContext | null;
  existingDoc?: Record<string, unknown>;
  incomingDoc?: Record<string, unknown>;
  expectedResult: 'PERMISSION_DENIED';
}

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const ALLOWED_KEYS = [
  'uid',
  'displayName',
  'email',
  'photoURL',
  'highestUnlockedLevel',
  'totalScore',
  'soundEnabled',
  'levels',
  'createdAt',
  'updatedAt',
] as const;

function isValidProfile(data: Record<string, unknown>, userId: string, authUid: string): boolean {
  const keys = Object.keys(data);
  if (!ALLOWED_KEYS.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => (ALLOWED_KEYS as readonly string[]).includes(k))) return false;

  if (typeof data.uid !== 'string' || data.uid !== authUid || data.uid !== userId) return false;
  if (!VALID_ID_REGEX.test(data.uid) || data.uid.length > 128) return false;
  if (typeof data.displayName !== 'string' || data.displayName.length < 1 || data.displayName.length > 80) return false;
  if (typeof data.email !== 'string' || data.email.length < 3 || data.email.length > 160) return false;
  if (typeof data.photoURL !== 'string' || data.photoURL.length > 500) return false;
  if (
    typeof data.highestUnlockedLevel !== 'number' ||
    !Number.isInteger(data.highestUnlockedLevel) ||
    data.highestUnlockedLevel < 1 ||
    data.highestUnlockedLevel > 200
  ) {
    return false;
  }
  if (
    typeof data.totalScore !== 'number' ||
    !Number.isInteger(data.totalScore) ||
    data.totalScore < 0 ||
    data.totalScore > 500000000
  ) {
    return false;
  }
  if (typeof data.soundEnabled !== 'boolean') return false;
  if (
    typeof data.levels !== 'object' ||
    data.levels === null ||
    Array.isArray(data.levels) ||
    Object.keys(data.levels).length > 200
  ) {
    return false;
  }
  if (data.createdAt !== 'SERVER_TIME' || data.updatedAt !== 'SERVER_TIME') return false;

  return true;
}

export function evaluateRuleSimulation(tc: DirtyDozenCase): 'ALLOWED' | 'PERMISSION_DENIED' {
  if (tc.operation === 'list' || tc.operation === 'delete') return 'PERMISSION_DENIED';
  if (!tc.auth || !tc.auth.emailVerified) return 'PERMISSION_DENIED';
  if (!VALID_ID_REGEX.test(tc.targetUserId) || tc.targetUserId.length > 128) return 'PERMISSION_DENIED';
  if (tc.auth.uid !== tc.targetUserId) return 'PERMISSION_DENIED';

  if (tc.operation === 'get') return 'ALLOWED';

  if (!tc.incomingDoc || !isValidProfile(tc.incomingDoc, tc.targetUserId, tc.auth.uid)) {
    return 'PERMISSION_DENIED';
  }

  if (tc.operation === 'update') {
    if (!tc.existingDoc) return 'PERMISSION_DENIED';
    if (tc.incomingDoc.uid !== tc.existingDoc.uid) return 'PERMISSION_DENIED';
    if (tc.incomingDoc.createdAt !== tc.existingDoc.createdAt) return 'PERMISSION_DENIED';
    const prevLv = tc.existingDoc.highestUnlockedLevel as number;
    const nextLv = tc.incomingDoc.highestUnlockedLevel as number;
    const levelMapSize = Object.keys(tc.incomingDoc.levels as Record<string, unknown>).length;
    if (nextLv < prevLv || nextLv > levelMapSize + 1) return 'PERMISSION_DENIED';
  }

  return 'ALLOWED';
}

const baseDoc = {
  uid: 'player1',
  displayName: 'Trainer Minh',
  email: 'minh@example.com',
  photoURL: '',
  highestUnlockedLevel: 1,
  totalScore: 0,
  soundEnabled: true,
  levels: {},
  createdAt: 'SERVER_TIME',
  updatedAt: 'SERVER_TIME',
};

export const DIRTY_DOZEN_TESTS: DirtyDozenCase[] = [
  {
    name: '1. Unauthenticated read denied',
    operation: 'get',
    targetUserId: 'player1',
    auth: null,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '2. Unverified email spoof denied',
    operation: 'create',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: false },
    incomingDoc: baseDoc,
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '3. Cross-tenant get denied',
    operation: 'get',
    targetUserId: 'player2',
    auth: { uid: 'player1', emailVerified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '4. Collection list scraping denied',
    operation: 'list',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '5. UID spoofing in payload denied',
    operation: 'create',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    incomingDoc: { ...baseDoc, uid: 'player2' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '6. Shadow ghost field (isAdmin) denied',
    operation: 'create',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    incomingDoc: { ...baseDoc, isAdmin: true },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '7. Client-spoofed timestamp denied',
    operation: 'create',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    incomingDoc: { ...baseDoc, createdAt: '2025-01-01T00:00:00Z' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '8. Immutable createdAt tampering on update denied',
    operation: 'update',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    existingDoc: { ...baseDoc, createdAt: 'OLD_TIME' },
    incomingDoc: { ...baseDoc, createdAt: 'SERVER_TIME' },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '9. Level shortcutting (1 -> 200) denied',
    operation: 'update',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    existingDoc: baseDoc,
    incomingDoc: { ...baseDoc, highestUnlockedLevel: 200 },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '10. Type poisoning on levels (array instead of map) denied',
    operation: 'update',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    existingDoc: baseDoc,
    incomingDoc: { ...baseDoc, levels: [] },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '11. Oversized displayName bloat denied',
    operation: 'create',
    targetUserId: 'player1',
    auth: { uid: 'player1', emailVerified: true },
    incomingDoc: { ...baseDoc, displayName: 'A'.repeat(250) },
    expectedResult: 'PERMISSION_DENIED',
  },
  {
    name: '12. Invalid path variable ID poisoning denied',
    operation: 'get',
    targetUserId: 'bad$id!with*chars',
    auth: { uid: 'bad$id!with*chars', emailVerified: true },
    expectedResult: 'PERMISSION_DENIED',
  },
];
