import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOutletContext } from 'react-router';
import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import FileMissingEpisodes from '@/components/Collection/Files/FilesMissingEpisodes';
import FileOverview from '@/components/Collection/Files/FilesOverview';
import FilesSummaryGroups from '@/components/Collection/Files/FilesSummaryGroup';
import MultiStateButton from '@/components/Input/MultiStateButton';
import { useSeriesFileSummaryQuery } from '@/core/react-query/webui/queries';

import type { SeriesContextType } from '@/components/Collection/constants';
import type { WebuiSeriesFileSummaryType } from '@/core/types/api/webui';

type ModeType = 'Series' | 'Missing';

type FileSelectionHeaderProps = {
  mode: ModeType;
  setMode: (mode: ModeType) => void;
  fileSummary?: WebuiSeriesFileSummaryType;
};
const FilesSelectionHeader = React.memo(({ fileSummary, mode, setMode }: FileSelectionHeaderProps) => {
  const { t } = useTranslation('series');
  const tabStates: { label: string, value: ModeType }[] = [
    { label: t('files.tabs.series'), value: 'Series' },
    { label: t('files.tabs.missing'), value: 'Missing' },
  ];
  const modeLabel = t(`files.tabs.${mode.toLowerCase()}`);
  const count = mode === 'Series'
    ? fileSummary?.Groups.length ?? 0
    : fileSummary?.MissingEpisodes.length ?? 0;
  const entryLabel = count === 1
    ? t('files.entry_one')
    : t('files.entry_other');

  return (
    <div className="flex h-[6.125rem] items-center justify-between rounded-lg border border-panel-border bg-panel-background-transparent px-6 py-4">
      <div className="flex gap-x-2 text-xl font-semibold">
        {modeLabel}
        &nbsp;|
        <span className="text-panel-text-important">{count}</span>
        {entryLabel}
      </div>
      <MultiStateButton activeState={mode} states={tabStates} onStateChange={setMode} />
    </div>
  );
});

const SeriesFileSummary = () => {
  const { t } = useTranslation('series');
  const { series } = useOutletContext<SeriesContextType>();

  const [mode, setMode] = useState<ModeType>('Series');

  const { data: fileSummary, isLoading } = useSeriesFileSummaryQuery(
    series.IDs.ID,
    { groupBy: 'GroupName,FileVersion,FileLocation,AudioLanguages,SubtitleLanguages,VideoResolution' },
  );

  return (
    <>
      <title>{t('pageTitle.files', { name: series.Name })}</title>
      <div className="flex w-full gap-x-6">
        <div className="flex flex-col gap-y-6">
          <FileOverview overview={fileSummary?.Overview} />
        </div>

        <div className="flex w-full flex-col gap-y-6">
          <FilesSelectionHeader
            mode={mode}
            setMode={setMode}
            fileSummary={fileSummary}
          />

          <div className="flex grow flex-col gap-y-6">
            {isLoading && (
              <div className="flex grow items-center justify-center text-panel-text-primary">
                <Icon path={mdiLoading} spin size={3} />
              </div>
            )}
            {mode === 'Series'
              ? <FilesSummaryGroups groups={fileSummary?.Groups} />
              : <FileMissingEpisodes missingEps={fileSummary?.MissingEpisodes} />}
          </div>
        </div>
      </div>
    </>
  );
};

export default SeriesFileSummary;
