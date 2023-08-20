import '@tanstack/react-table';

declare module '@tanstack/react-table' {
  /* eslint-disable-next-line  @typescript-eslint/consistent-type-definitions */
  interface ColumnMeta {
    className?: string;
  }
}
