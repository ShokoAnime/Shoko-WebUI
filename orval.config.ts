import { readFile, writeFile } from 'node:fs/promises';

import { defineConfig } from 'orval';

import type { InputTransformerFn } from 'orval';

const PROXY_TARGET_KEY = '^/(api|plex)/.*';
const DEFAULT_SHOKO_SERVER_URL = 'http://localhost:8111';
const GENERATED_SCHEMAS_FILE = 'src/core/api/generated/shokoServerAPI30.schemas.ts';
const ZOD_IMPORT = "import * as zod from 'zod';\n\n";

// Shoko Server's OpenAPI spec has a handful of operations (all under the
// "Group" tag's image endpoints) that declare a path parameter with no
// matching `{name}` segment in the route template — e.g. `groupID` is
// declared as a path param on `/Group/{seriesID}/Images/{imageType}`, which
// has no `{groupID}` segment. This is a real bug in the server's route
// attributes, not something wrong with this config. Orval's spec validator
// rejects it outright, so it's stripped here (rather than disabling
// validation globally, which would also hide genuine drift elsewhere) —
// remove this transformer once it's fixed server-side.
const dropOrphanedPathParameters: InputTransformerFn = (spec) => {
  for (const [route, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const operation of Object.values(pathItem ?? {})) {
      if (typeof operation !== 'object' || operation === null || !('parameters' in operation)) continue;

      operation.parameters = (operation.parameters ?? []).filter(param =>
        !('name' in param) || param.in !== 'path' || route.includes(`{${param.name}}`)
      );
    }
  }

  return spec;
};

// A couple of routes (e.g. `Series/Search`, `Series/AniDB/Search`) have both
// a current operation and an `@deprecated` legacy twin at the exact same
// route+verb-derived shape. With no `operationId` anywhere in this spec,
// Orval's fallback name synthesis can't tell them apart and emits the same
// export name for both, which fails to compile ("Cannot redeclare
// block-scoped variable"). Dropping deprecated operations fixes the
// collision at the root and is reasonable on its own merits — the WebUI
// shouldn't be generating clients for endpoints the server already flags as
// deprecated.
const dropDeprecatedOperations: InputTransformerFn = (spec) => {
  for (const pathItem of Object.values(spec.paths ?? {})) {
    for (const [verb, operation] of Object.entries(pathItem ?? {})) {
      if (typeof operation !== 'object' || operation === null || !('deprecated' in operation)) continue;
      if (operation.deprecated) delete (pathItem as Record<string, unknown>)[verb];
    }
  }

  return spec;
};

const transformSpec: InputTransformerFn = async spec => dropDeprecatedOperations(await dropOrphanedPathParameters(spec));

const importProxyConfig = async (path: string) => {
  const proxyModule = (await import(path)) as { default?: Record<string, unknown> } & Record<string, unknown>;
  return proxyModule.default ?? proxyModule;
};

// Mirrors the same fallback chain vite.config.mjs uses for the dev proxy, so
// `pnpm orval` always targets whatever Shoko Server the developer already
// pointed their dev proxy at (falling back to the committed default).
const resolveShokoServerUrl = async () => {
  const proxyConfig = await importProxyConfig('./proxy.config.js').catch(() =>
    importProxyConfig('./proxy.config.default.js')
  );
  const target = proxyConfig[PROXY_TARGET_KEY];

  return typeof target === 'string' ? target : DEFAULT_SHOKO_SERVER_URL;
};

// Orval 8.23's `generateReusableSchemas` (an experimental option — see its
// own doc comment) writes the shared, deduplicated component schemas to
// `shokoServerAPI30.schemas.ts` but omits the `import * as zod from 'zod'`
// header that file needs, even though every export in it calls `zod.*`.
// Patches it back in after generation. Remove once fixed upstream.
const fixMissingZodImport = async () => {
  const contents = await readFile(GENERATED_SCHEMAS_FILE, 'utf8');
  if (contents.startsWith(ZOD_IMPORT)) return;
  await writeFile(GENERATED_SCHEMAS_FILE, ZOD_IMPORT + contents);
};

// So a stale `src/core/api/generated/` (committed, regenerated manually) is
// easy to spot: stamp every generated file with when it was generated and
// which Shoko Server build it was generated against, via the same `Init/Version`
// endpoint the app itself uses (`useVersionQuery`, `src/core/react-query/init/queries.ts`).
const resolveShokoServerVersion = async (shokoServerUrl: string) => {
  try {
    const response = await fetch(`${shokoServerUrl}/api/v3/Init/Version`);
    const data = (await response.json()) as { Server?: { Version?: string } };
    return data.Server?.Version ?? 'unknown';
  } catch {
    return 'unknown';
  }
};

export default defineConfig(async () => {
  const shokoServerUrl = await resolveShokoServerUrl();
  const shokoServerVersion = await resolveShokoServerVersion(shokoServerUrl);
  const generatedAt = new Date().toISOString();

  return {
    shoko: {
      input: {
        target: `${shokoServerUrl}/swagger/v3/swagger.json`,
        override: {
          transformer: transformSpec,
        },
      },
      output: {
        client: 'zod',
        mode: 'tags-split',
        target: 'src/core/api/generated',
        clean: true,
        override: {
          zod: {
            // One reusable schema per named OpenAPI component (e.g. `Tag`)
            // instead of the shape being duplicated inline in every response
            // schema that references it.
            generateReusableSchemas: true,
          },
          header: info => [
            `Generated by orval from Shoko Server's OpenAPI spec (API v${info.version}).`,
            'Do not edit manually — run `pnpm orval` to regenerate.',
            `Generated at: ${generatedAt}`,
            `Shoko Server version at generation time: ${shokoServerVersion}`,
          ],
        },
      },
      hooks: {
        // src/core/api/generated/** is excluded from oxlint entirely
        // (.oxlintrc.json) — Orval's tags-split output structurally uses
        // relative parent imports between generated files, which the repo's
        // hand-written-code lint rules disallow. dprint still formats it for
        // readability.
        afterAllFilesWrite: [
          fixMissingZodImport,
          './node_modules/.bin/dprint fmt src/core/api/generated/**/*.ts',
        ],
      },
    },
  };
});
