# Issue #2: Migrate from Remix Classic Compiler to Vite

**Issue Link**: https://github.com/oreillyjw/supa-fly-stack/issues/2

## Current State Analysis

### Existing Configuration
- **Build System**: Remix classic compiler (via `remix.config.js`)
- **Module Format**: CommonJS (`serverModuleFormat: "cjs"`)
- **TypeScript**: Using CommonJS modules
- **Node Version**: >=20 (needs update to 22.x)
- **Remix Packages**: Currently using wildcard versions (`*`)
- **Vite**: Already partially included (v5.0.10) for Vitest

### Key Files to Modify
1. `package.json` - Update dependencies, scripts, and Node version
2. `tsconfig.json` - Switch from CommonJS to ESNext modules
3. `vite.config.ts` - Create new Vite config with Vercel preset
4. `app/entry.client.tsx` - Check for Vite compatibility
5. `app/entry.server.tsx` - Check for Vite compatibility
6. `remix.config.js` - DELETE this file

## Migration Plan

### Phase 1: Dependency Updates
1. Update all `@remix-run/*` packages to version `2.16.7` (or `2.17.0`)
2. Add `@vercel/remix@^2.16.7` for Vercel deployment support
3. Update `vite` to `^6.4.1`
4. Update `vite-tsconfig-paths` to `^5.1.4`
5. Add required Vite plugins:
   - `remix-flat-routes` (if using flat routes)
   - Any other server-only plugins needed
6. Update Node engine to `22.x`

### Phase 2: Configuration Changes

#### package.json Scripts
```json
{
  "build": "vite build && vite build --ssr",
  "dev": "vite dev",
  "start": "@vercel/remix" or "vite preview"
}
```

#### tsconfig.json Updates
- Change `module` from `"CommonJS"` to `"ESNext"`
- Update `moduleResolution` to `"Bundler"` (recommended for Vite)
- Keep `noEmit: true` as Vite handles building
- Ensure `types` array includes Vite types

#### vite.config.ts Creation
```typescript
import { vitePlugin as remix } from "@remix-run/dev";
import { vercelPreset } from "@vercel/remix/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    remix({
      preset: vercelPreset(),
      ignoredRouteFiles: ["**/.*"],
      // serverModuleFormat: "esm", // Default for Vite
    }),
    tsconfigPaths(),
  ],
  // Watch Tailwind config
  server: {
    watch: {
      include: ["./tailwind.config.ts"],
    },
  },
});
```

### Phase 3: Entry File Updates

#### entry.client.tsx
- Current file looks compatible with Vite
- No changes expected but verify after migration

#### entry.server.tsx
- Current file uses Node streams (PassThrough)
- Should be compatible with Vite
- May need to verify `@remix-run/node` imports work correctly

### Phase 4: Testing Checklist
1. ✅ npm install succeeds (resolve any dependency conflicts)
2. ✅ npm run dev starts dev server on http://localhost:3000
3. ✅ npm run build completes without errors
4. ✅ npm run start serves the built application
5. ✅ All routes work correctly (test main routes manually)
6. ✅ Run full test suite: `npm run validate`
7. ✅ Verify Cypress E2E tests pass
8. ✅ Verify Vitest unit tests pass

### Phase 5: Cleanup
- Delete `remix.config.js`
- Remove any unused dependencies
- Update any CI/CD configurations if needed

## Potential Issues & Solutions

### Issue 1: CommonJS to ESM Migration
**Problem**: Code currently uses `module.exports` and `require()`
**Solution**: The app code itself uses ESM (`import`/`export`), only configs use CommonJS. Vite will handle this.

### Issue 2: Vite 6.x Breaking Changes
**Problem**: Upgrading from Vite 5 to Vite 6 may have breaking changes
**Solution**: Review Vite 6 changelog and test thoroughly

### Issue 3: Server Module Format
**Problem**: Previously using CJS, now defaulting to ESM
**Solution**: Vite default is ESM which is preferred. Verify all Node.js code is compatible.

### Issue 4: Tailwind Watch Path
**Problem**: Need to ensure Tailwind config changes trigger rebuilds
**Solution**: Configure in `server.watch.include` in vite.config.ts

## Implementation Order

1. Create feature branch: `git checkout -b 2-upgrade-to-vite-build-system`
2. Update `package.json` (dependencies + scripts)
3. Run `npm install` to verify no conflicts
4. Create `vite.config.ts`
5. Update `tsconfig.json`
6. Test entry files (likely no changes needed)
7. Delete `remix.config.js`
8. Test: `npm run dev`
9. Test: `npm run build`
10. Test: `npm run start`
11. Run full test suite
12. Commit changes with descriptive message
13. Open PR for review

## References
- Remix Vite Documentation: https://remix.run/docs/en/main/guides/vite
- Vercel Remix Preset: https://vercel.com/docs/frameworks/remix
- Vite Documentation: https://vitejs.dev/
