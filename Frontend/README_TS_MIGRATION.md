TypeScript migration — Frontend
=================================

Goal: enable TypeScript support and migrate files gradually while keeping existing JavaScript files working.

Quick setup
-----------

1. Install dev dependencies (npm):

```bash
cd Frontend
npm install --save-dev typescript @types/react @types/react-native
```

Or with yarn:

```bash
cd Frontend
yarn add -D typescript @types/react @types/react-native
```

2. Run a type-check to see TypeScript diagnostics (no emit):

```bash
npm run type-check
```

What I added
------------
- `tsconfig.json` — configured with `allowJs: true`, `jsx: react-native`, and `noEmit: true` so JS files continue to work and TypeScript won't produce build artifacts.
- `declarations.d.ts` — global module declarations for image and JSON imports so new TS/TSX files can import assets without extra config.
- `package.json` — `type-check` script and suggested devDependencies (you still need to run the install command above).

Migration strategy
------------------
- Keep `allowJs: true` while you convert files one-by-one.
- Rename component files that use JSX to `.tsx` when you start adding types to them.
- Run `npm run type-check` regularly to catch typing issues early.
- Gradually enable stricter checks in `tsconfig.json` (e.g. set `strict: true`) once a chunk of the codebase is typed.

Notes & common fixes
--------------------
- If you import a library without types, add `npm i -D @types/<library>` or create a local declaration file (e.g. `declarations.d.ts`) and `declare module '<lib>';`.
- For platform-specific typings (navigation, redux), install corresponding `@types` packages or the library's own TypeScript types.

If you want, I can now:
- run through `src/` and convert a single small component to TypeScript as an example,
- or add ESLint + TypeScript integration next.
