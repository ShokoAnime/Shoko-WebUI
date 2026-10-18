import type { ReactNode } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';

type Props = {
  errorText: string;
  isError: boolean;
  onRetry: () => void;
};

export const PaneSpinner = () => <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;

/** A centred message for a pane with nothing to show, with a muted line under it. */
export const PaneMessage = ({ children, title }: { children?: ReactNode, title: string }) => (
  <div className="m-auto flex flex-col items-center gap-y-2 text-center font-semibold">
    <span>{title}</span>
    {children && <span className="opacity-65">{children}</span>}
  </div>
);

const PaneState = ({ errorText, isError, onRetry }: Props) => {
  if (!isError) return <PaneSpinner />;
  return (
    <div className="m-auto flex flex-col items-center gap-y-4 font-semibold">
      <span className="text-panel-text-danger">{errorText}</span>
      <Button buttonType="secondary" buttonSize="normal" onClick={onRetry}>Try Again</Button>
    </div>
  );
};

export default PaneState;
