/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GITHASH: string
  readonly VITE_APPVERSION: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
