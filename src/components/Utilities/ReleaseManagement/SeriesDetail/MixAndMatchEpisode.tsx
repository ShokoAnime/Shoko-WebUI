import AnimateHeight from 'react-animate-height';
import { mdiAlertOutline, mdiChevronDown, mdiRadioboxBlank, mdiRadioboxMarked } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import prettyBytes from 'pretty-bytes';
import { useToggle } from 'usehooks-ts';

import { Badge } from '@/components/Badge';

export type FileOption = {
  placeID: number;
  absolutePath?: string;
  fileSize: number;
  autofillKey: string;
  groupLabel: string;
  version: number;
  isChaptered?: boolean;
  isVariation: boolean;
  subtitleStreamCount: number;
  source?: string;
  resolution?: string;
  videoCodec?: string;
  bitDepth: number;
  audioCodec?: string;
  audioLanguages: string[];
  subtitleLanguages: string[];
};

export type EpisodeRow = {
  type: string;
  number: number;
  key: string;
  options: FileOption[];
};

const getOptionSummary = (option: FileOption): string => {
  const parts: string[] = [];
  if (option.isChaptered) parts.push('ch');
  if (option.subtitleStreamCount > 0) {
    parts.push(`${option.subtitleStreamCount} ${option.subtitleStreamCount === 1 ? 'sub' : 'subs'}`);
  }
  if (option.version > 0) parts.push(`v${option.version}`);
  if (option.source) parts.push(option.source);
  if (option.resolution) parts.push(option.resolution);
  if (option.videoCodec) parts.push(option.videoCodec);
  if (option.bitDepth > 0 && option.bitDepth !== 8) parts.push(`${option.bitDepth}-bit`);
  if (option.audioCodec) parts.push(option.audioCodec);
  return parts.join(', ');
};

type Props = {
  episode: EpisodeRow;
  selectedPlaceID: number | undefined;
  onSelectOption: (episodeKey: string, placeID: number) => void;
};

export const MixAndMatchEpisode = ({
  episode,
  onSelectOption,
  selectedPlaceID,
}: Props) => {
  const [isExpanded, toggleExpanded] = useToggle(false);

  const selectedOption = episode.options.find(option => option.placeID === selectedPlaceID);

  return (
    <div
      className={cx(
        'rounded-lg border odd:bg-panel-background even:bg-panel-background-alt',
        !selectedPlaceID ? 'border-panel-text-danger' : 'border-panel-border',
      )}
    >
      <button
        type="button"
        className="flex w-full items-center gap-x-3 p-3 text-left"
        onClick={toggleExpanded}
      >
        <div className="w-32 shrink-0">
          <div className="text-sm font-semibold">{`${episode.type} ${episode.number}`}</div>
          <div className="text-xs opacity-50">
            {episode.options.length} {episode.options.length === 1 ? 'file' : 'files'}
          </div>
        </div>
        <span className="min-w-0 grow text-sm">
          {!selectedPlaceID && (
            <span className="flex items-center gap-x-1 font-semibold text-panel-text-danger">
              <Icon path={mdiAlertOutline} size={0.6667} />
              Unassigned
            </span>
          )}
          {selectedOption && (
            <>
              <span className="font-semibold">{selectedOption.groupLabel}</span>{' '}
              {selectedOption.isVariation && <Badge className="bg-panel-input">Variation</Badge>}{' '}
              <span className="opacity-65">
                - {getOptionSummary(selectedOption)}, {prettyBytes(selectedOption.fileSize, { binary: true })}
              </span>
            </>
          )}
        </span>
        <Icon
          path={mdiChevronDown}
          size={0.8333}
          rotate={isExpanded ? -180 : 0}
          className="shrink-0 transition-transform"
        />
      </button>

      <AnimateHeight height={isExpanded ? 'auto' : 0}>
        {isExpanded && (
          <div className="border-t border-panel-border">
            {episode.options.map((option) => {
              const { absolutePath, audioLanguages, fileSize, groupLabel, isVariation, placeID, subtitleLanguages } =
                option;
              const isSelected = selectedPlaceID === placeID;
              const fileName = absolutePath?.split(/[/\\]/).pop() ?? `Place ${placeID}`;
              const summary = getOptionSummary(option);

              return (
                <button
                  key={placeID}
                  type="button"
                  className={cx(
                    'flex w-full items-start gap-3 border-b border-panel-border/50 px-4 py-2.5 text-left text-sm transition-colors last:border-0',
                    isSelected
                      ? 'bg-panel-background-selected-row'
                      : 'hover:bg-panel-background-selected-row',
                  )}
                  onClick={() => onSelectOption(episode.key, placeID)}
                >
                  <Icon
                    path={isSelected ? mdiRadioboxMarked : mdiRadioboxBlank}
                    size={0.8333}
                    className="mt-0.5 shrink-0 text-panel-icon-action"
                  />

                  <div className="min-w-0 grow">
                    <div className="flex items-center gap-x-2">
                      <div className="font-semibold">{groupLabel}</div>
                      {isVariation && <Badge className="bg-panel-input">Variation</Badge>}
                    </div>
                    <div className="text-xs opacity-65">{summary}</div>
                    {(audioLanguages.length > 0 || subtitleLanguages.length > 0) && (
                      <div className="text-xs opacity-65">
                        {audioLanguages.length > 0 && `Audio: ${audioLanguages.join(', ')}`}
                        {audioLanguages.length > 0 && subtitleLanguages.length > 0 && ', '}
                        {subtitleLanguages.length > 0 && `Subs: ${subtitleLanguages.join(', ')}`}
                      </div>
                    )}
                    {absolutePath != null
                      ? <div className="truncate text-xs opacity-50">{fileName}</div>
                      : <div className="text-xs text-panel-text-warning">Path unavailable</div>}
                  </div>

                  <div className="shrink-0 text-xs opacity-65">
                    {prettyBytes(fileSize, { binary: true })}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </AnimateHeight>
    </div>
  );
};
