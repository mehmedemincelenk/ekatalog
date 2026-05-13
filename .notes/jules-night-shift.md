# JULES NIGHT SHIFT - AUTONOMOUS MEGA TASK

## ROLE

You are an elite, autonomous senior engineer executing an overnight "Night Shift" operation. You have 3 distinct phases to complete sequentially. You must finish Phase 1 before starting Phase 2, and Phase 2 before Phase 3. Take your time, verify your work, and do NOT alter the UI or behavior of the app.

---

## 🛑 ABSOLUTE RULES

1. **NO UI CHANGES:** You are not allowed to change any styling (Tailwind classes), visual logic, or layout.
2. **NO APP BREAKING:** The application must compile perfectly via TypeScript (`npm run build`) without a single error after your shift.
3. **ONLY ENGLISH COMMENTS:** All written comments, architectural mapping, and annotations MUST be in professional English.

---

## 🛠️ PHASE 1: DEEP CLEAN & TYPE SAFETY (Sanitation)

**Objective:** Purge the codebase of unused junk and ensure strict TypeScript safety.
**Scope:** `src/**/*.ts` and `src/**/*.tsx`

1. **Delete Unnecessary Logs:** Find and delete all `console.log`, `console.warn`, and `console.error` statements inside components and hooks (keep them ONLY if they are inside `try/catch` error handlers).
2. **Remove Dead Code:** Delete unused imports and explicitly commented-out blocks of code that have been abandoned.
3. **Fix `any` Types:** Scan the file. If you see variables typed as `any`, attempt to provide an inline type or import the correct interface from `src/types/index.ts`. If you cannot deduce the type, leave a comment `// TODO(Type): Replace any with proper interface`.

---

## 🗺️ PHASE 2: AI-MAP ANNOTATIONS (Vibe Coding Accelerator)

**Objective:** Add architectural metadata comments to make the codebase extremely easy for future AI models to read.
**Scope:** Main functional files inside `src/hooks`, `src/utils`, `src/data`, and key components like `src/App.tsx`.

1. **File Headers:** Add this to line 1 of every major file you open:
   ```typescript
   // FILE ROLE: [One concise sentence about what this file powers]
   // DEPENDS ON: [List of crucial internal imports]
   // CONSUMED BY: [Where this is typically used]
   ```
2. **Architecture Blocks:** Above every major exported function or hook, add a vibe-coding guide:
   ```typescript
   // ARCHITECTURE: [Hook/Function Name]
   // PURPOSE: [What problem this solves]
   // AI_NOTE: [Any tricky edge cases or specific states a future AI should know about before editing this]
   ```
   _(Do NOT change any existing code here. Just inject these comments above the functions)._

---

## 🧠 PHASE 3: THE SMART SEARCH ALGORITHM (Preparation)

**Objective:** Build the logical engine for a "Tolerant Smart Search" (Fuzzy Search) without hooking it into the UI.
**Action:** Create a completely new file: `src/utils/smartSearch.ts`

1. Write a highly optimized, robust function `export const smartSearch = (query: string, products: Product[]): Product[] => { ... }`
2. **Requirements:**
   - Case insensitive.
   - **Turkish character tolerance:** If a user types "ambalez" or "ambalej", it should ideally match "Ambalaj". (Use simple regex replacements for ı->i, ş->s, ğ->g, ç->c, ö->o, ü->u).
   - Word boundary checking (if you search for "kutu", it should rank products starting with "kutu" higher than products containing "kutu" randomly in the description).
   - Do NOT connect this to `App.tsx` or `SearchFilter.tsx`. Just write and perfectly document the algorithm in its own isolated utility file.

---

## 🏁 FINAL COMPLETION CHECKLIST

Before ending your task, ensure:

- [ ] No visual components were damaged.
- [ ] TypeScript is entirely intact.
- [ ] `src/utils/smartSearch.ts` has been written and documented perfectly.
- [ ] Architectural headers exist in critical locations.

_Start with Phase 1. Once verified, move to Phase 2. Finish with Phase 3._
