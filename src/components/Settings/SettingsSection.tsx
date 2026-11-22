import type { ReactNode } from 'react';

type Props = {
  actions?: ReactNode;
  children: ReactNode;
  title: ReactNode;
};

const SettingsSection = ({ actions, children, title }: Props) => (
  <div className="flex flex-col gap-y-6">
    <div className="flex items-center justify-between">
      <div className="font-semibold">{title}</div>
      {actions}
    </div>
    {children}
  </div>
);

export default SettingsSection;
