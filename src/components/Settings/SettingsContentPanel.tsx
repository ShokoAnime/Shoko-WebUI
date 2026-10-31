import type { ReactNode } from 'react';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

type Props = {
  children: ReactNode;
  isLoading: boolean;
  isPadded: boolean;
};

const SettingsContentPanel = ({ children, isLoading, isPadded }: Props) => (
  <div
    className={cx(
      'flex min-h-full w-175 flex-col gap-y-6 overflow-y-visible rounded-lg border border-panel-border bg-panel-background-transparent',
      isPadded && 'p-6',
    )}
  >
    {isLoading
      ? (
        <div className="flex grow items-center justify-center text-panel-text-primary">
          <Icon path={mdiLoading} spin size={5} />
        </div>
      )
      : children}
  </div>
);

export default SettingsContentPanel;
