import type { ReactNode } from 'react';
import cx from 'classnames';

type Props = {
  children: ReactNode;
  className?: string;
};

const InsetPanel = ({ children, className }: Props) => (
  <div className={cx('rounded-lg border border-panel-border bg-panel-input', className)}>
    {children}
  </div>
);

export default InsetPanel;
