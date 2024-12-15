// eslint-disable-next-line no-restricted-imports
import { useNavigate } from 'react-router';
import type { NavigateOptions, To } from 'react-router';

type NavigateFunctionVoid = {
  (to: To, options?: NavigateOptions): void;
  (delta: number): void;
};

// React Router v7 uses return type for `navigate` function as Promise<void> | void
// This causes the linter to complain about not catching errors on navigate calls
// But the return type is actually void for BrowserRouter, so we can safely ignore the type
const useNavigateVoid = () => useNavigate() as NavigateFunctionVoid;

export default useNavigateVoid;
