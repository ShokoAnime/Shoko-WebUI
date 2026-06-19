/// <reference types="vite/client" />
// oxlint-disable-next-line  typescript/consistent-type-definitions -- ImportMeta* must be interfaces for declaration merging
interface ImportMetaEnv {
  readonly VITE_GITHASH: string;
  readonly VITE_APPVERSION: string;
  readonly VITE_MIN_SERVER_VERSION: string;
  // more env variables...
}

// oxlint-disable-next-line  typescript/consistent-type-definitions -- must be interface for declaration merging
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
