/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
  readonly VITE_SCHEMA_URL: string
  readonly VITE_SUBMIT_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
