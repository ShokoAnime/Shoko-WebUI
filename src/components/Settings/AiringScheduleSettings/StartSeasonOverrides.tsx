import { useRef, useState } from 'react';
import { mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { buttonSizeClasses, buttonTypeClasses } from '@/components/Input/Button.utils';
import {
  useExportStartSeasonOverridesMutation,
  useImportStartSeasonOverridesMutation,
  useResetStartSeasonMutation,
} from '@/core/react-query/airing-schedule/mutations';
import { useStartSeasonOverridesQuery } from '@/core/react-query/airing-schedule/queries';
import toast from '@/core/toast';
import { getAnidbAnimeLink } from '@/core/util';
import { seasonKeyToString } from '@/core/utilities/season';
import { formatStartSeasonImport } from '@/core/utilities/startSeason';

import type { StartSeasonImportSummaryType, StartSeasonOverrideType } from '@/core/types/api/airing-season';

type RowProps = {
  override: StartSeasonOverrideType;
  onRemove: () => void;
  isRemoving: boolean;
  disabled: boolean;
};

const OverrideRow = ({ disabled, isRemoving, onRemove, override }: RowProps) => (
  <div className="flex items-center justify-between gap-x-4 py-1">
    <div className="flex min-w-0 items-center gap-x-3">
      <a
        href={getAnidbAnimeLink(override.AnidbAnimeID)}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 text-sm text-panel-text-primary"
      >
        {override.AnidbAnimeID}
      </a>
      <span className={cx('truncate', !override.Title && 'opacity-65')}>
        {override.Title ?? 'Unknown anime'}
      </span>
    </div>
    <div className="flex shrink-0 items-center gap-x-3">
      <span className="text-sm opacity-65">
        {seasonKeyToString({ year: override.Year, season: override.Season })}
      </span>
      <Button onClick={onRemove} tooltip="Remove" disabled={disabled} loading={isRemoving}>
        <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
      </Button>
    </div>
  </div>
);

/** What the last import did, with the lines it rejected. */
const ImportReport = ({ summary }: { summary: StartSeasonImportSummaryType }) => (
  <div className="flex flex-col gap-y-1 rounded-lg border border-panel-border bg-panel-input px-4 py-2 text-sm">
    <span className="font-semibold">{`Imported: ${formatStartSeasonImport(summary)}`}</span>
    {summary.Rejected.map(line => (
      <div key={line.Line} className="flex min-w-0 gap-x-2">
        <span className="shrink-0 opacity-65">{`Line ${line.Line}`}</span>
        <span className="max-w-64 shrink-0 truncate font-mono">{line.Text}</span>
        <span className="min-w-0 text-panel-text-danger">{line.Reason}</span>
      </div>
    ))}
  </div>
);

/** The start seasons admins set by hand: exported and imported as CSV, and removed one by one. Saved at once. */
const StartSeasonOverrides = () => {
  const overridesQuery = useStartSeasonOverridesQuery();
  const { isPending: isExporting, mutate: exportOverrides } = useExportStartSeasonOverridesMutation();
  const { isPending: isImporting, mutate: importOverrides } = useImportStartSeasonOverridesMutation();
  const { isPending: isRemoving, mutate: removeOverride, variables: removingId } = useResetStartSeasonMutation();
  const [summary, setSummary] = useState<StartSeasonImportSummaryType | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const overrides = overridesQuery.data ?? [];

  const handleImport = (file?: File) => {
    if (!file) return;
    // The same file again is a new import.
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSummary(null);
    importOverrides(file, {
      onSuccess: (result) => {
        setSummary(result);
        toast.success('Start season overrides imported!', formatStartSeasonImport(result));
      },
    });
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-1">
        <div className="flex items-center gap-x-2 font-semibold">
          Start Season Overrides
          <span className="text-sm font-normal opacity-65">{overrides.length}</span>
        </div>
        <div className="text-sm opacity-65">
          Anime moved to another season by hand, from a card in the season view or by importing a CSV file of
          AnidbAnimeID, Year and Season. Saved at once.
        </div>
      </div>
      <div className="flex items-center gap-x-3">
        <Button
          buttonType="secondary"
          buttonSize="small"
          onClick={() => exportOverrides()}
          disabled={overrides.length === 0}
          loading={isExporting}
        >
          Export CSV
        </Button>
        <label
          className={cx(
            'rounded-lg border-2 text-sm font-semibold transition ease-in-out',
            buttonTypeClasses.secondary,
            buttonSizeClasses.small,
            isImporting ? 'cursor-default opacity-65' : 'cursor-pointer hover:bg-button-secondary-hover',
          )}
        >
          Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            disabled={isImporting}
            ref={fileInputRef}
            onChange={event => handleImport(event.target.files?.[0])}
          />
        </label>
      </div>
      {summary && <ImportReport summary={summary} />}
      {overrides.length > 0 && (
        <div className="flex max-h-64 flex-col overflow-y-auto rounded-lg border border-panel-border bg-panel-input px-4 py-2">
          {overrides.map(override => (
            <OverrideRow
              key={override.AnidbAnimeID}
              override={override}
              onRemove={() => removeOverride(override.AnidbAnimeID)}
              isRemoving={isRemoving && removingId === override.AnidbAnimeID}
              disabled={isRemoving}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StartSeasonOverrides;
