import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
};

const SettingsHeader = ({ actions, children, title }: Props) => (
  <>
    <title>{`Settings > ${title} | Shoko`}</title>
    <div className="flex flex-col gap-y-1">
      {actions
        ? (
          <div className="flex items-center justify-between">
            <div className="text-xl font-semibold">{title}</div>
            <div className="flex items-center gap-2">{actions}</div>
          </div>
        )
        : <div className="text-xl font-semibold">{title}</div>}
      <div>{children}</div>
    </div>
  </>
);

export default SettingsHeader;
