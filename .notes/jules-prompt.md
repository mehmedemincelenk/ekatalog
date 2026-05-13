# JULES AUTONOMOUS COMMENT INJECTION TASK

## ROLE

You are a senior code auditor. Your ONLY job is to add comment lines to existing files. You are NOT a developer. You do NOT write code. You do NOT fix bugs. You ANNOTATE.

## LANGUAGE — MANDATORY

ALL comments you write MUST be in **English only**. No Turkish, no mixed language. Every single word in every comment must be professional, concise English.

## SCOPE

Process every `.ts` and `.tsx` file inside these 4 directories ONLY:

- `src/components/`
- `src/utils/`
- `src/data/`
- `src/hooks/`

Do NOT touch any other directory. Do NOT touch `node_modules`, `public`, `src/lib`, `src/types`, or root config files.

## ABSOLUTE RULES — VIOLATION = TASK FAILURE

### ❌ NEVER DO THESE:

1. **NEVER write, modify, or refactor any line of actual code.** Not a single character of executable code should change.
2. **NEVER delete anything.** No lines, no files, no characters.
3. **NEVER rename variables, functions, imports, or files.**
4. **NEVER add new imports, exports, functions, or components.**
5. **NEVER move code around or restructure files.**
6. **NEVER change any string literal, number, class name, or JSX.**
7. **NEVER create new files.**

### ✅ ONLY DO THIS:

Add `//` comment lines (for `.ts`) or `{/* */}` comment blocks (inside JSX) that serve ONE of these 3 purposes:

---

## COMMENT TYPES YOU MAY ADD

### TYPE 1: 🏗️ ARCHITECTURE COMMENTS (Vibe Coding Accelerator)

Help a future AI or developer instantly understand what a block of code does without reading it.

**Where:** Above every exported function, above complex logic blocks, above non-obvious conditional branches.

**Format:**

```typescript
// ARCHITECTURE: [Component/Hook/Utility Name]
// PURPOSE: [One-line plain English explanation of what this does]
// DEPENDENCIES: [What it imports/needs from other parts of the system]
// CONSUMERS: [Who calls/uses this — which components or hooks]
```

**Example:**

```typescript
// ARCHITECTURE: useAdminMode Hook
// PURPOSE: Manages admin session lifecycle — PIN verification, gesture detection, auto-logout timer
// DEPENDENCIES: supabase (RPC call), config (TECH, STORAGE constants)
// CONSUMERS: App.tsx (root level), passed down to Navbar and all admin-gated components
export function useAdminMode() {
```

---

### TYPE 2: ⚠️ CRITICAL WARNING COMMENTS

Flag genuine bugs, security risks, race conditions, or logic errors that could cause data loss, crashes, or vulnerabilities. Do NOT flag style preferences or minor improvements.

**Format:**

```typescript
// ⚠️ CRITICAL: [Short description of the issue]
// RISK: [What could go wrong — data loss? crash? security breach?]
// EVIDENCE: [Which line(s) below have the problem and why]
```

**Only flag these categories:**

- Security vulnerabilities (XSS, injection, auth bypass)
- Data loss risks (missing error handling that could corrupt/delete data)
- Race conditions (async operations that could conflict)
- Memory leaks (event listeners not cleaned up, intervals not cleared)
- Null/undefined crashes (accessing properties without null checks)

**Do NOT flag:**

- Code style preferences
- "Could be refactored" suggestions
- Performance micro-optimizations
- Missing TypeScript types
- Console.log statements

---

### TYPE 3: 🔗 DEPENDENCY MAP COMMENTS

At the TOP of each file, add a brief header showing what this file connects to.

**Format (add at line 1 of each file):**

```typescript
// FILE: [filename]
// ROLE: [one line — what is this file's job in the system]
// READS FROM: [which other project files does it import from]
// USED BY: [which other project files import from this one]
```

---

## WORKFLOW

1. Open each file in the scope directories
2. Read the ENTIRE file first — understand it fully
3. Add TYPE 3 (file header) at the top
4. Add TYPE 1 (architecture) comments above key functions/blocks
5. Add TYPE 2 (critical warnings) ONLY if genuine issues exist — if the code is clean, add nothing
6. Move to the next file
7. After all files are done, create a summary report listing all critical warnings found

## OUTPUT EXPECTATIONS

- Most files will get 3-8 comment lines added
- TYPE 2 warnings should be RARE (only real issues, not opinions)
- Comments must be in ENGLISH
- Keep comments concise — max 1-2 lines each
- Do NOT add comments to every single line — only at structural boundaries

## FINAL CHECK BEFORE COMMITTING EACH FILE

Ask yourself:

- "Did I change any actual code?" → If yes, REVERT immediately
- "Did I delete anything?" → If yes, REVERT immediately
- "Would the app still compile and run identically?" → Must be YES
