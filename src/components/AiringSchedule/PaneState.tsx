import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';

type Props = {
  errorText: string;
  isError: boolean;
  onRetry: () => void;
};

const PaneState = ({ errorText, isError, onRetry }: Props) => {
  if (!isError) return <Icon path={mdiLoading} size={4} spin className="m-auto text-panel-text-primary" />;
  return (
    <div className="m-auto flex flex-col items-center gap-y-4 font-semibold">
      <span className="text-panel-text-danger">{errorText}</span>
      <Button buttonType="secondary" buttonSize="normal" onClick={onRetry}>Try Again</Button>
    </div>
  );
};

export default PaneState;
