import React from 'react';
import { mdiDragHorizontalVariant, mdiInformationVariantCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import DnDList from '@/components/DnDList/DnDList';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import Select from '@/components/Input/Select';

import type { ReleaseComparisonPreferencesType } from '@/core/types/api/settings';
import type { DropResult } from '@hello-pangea/dnd';

const SIGNAL_NAMES: Record<number, string> = {
  0: 'Source',
  1: 'Resolution',
  2: 'Video Codec',
  3: 'Bit Depth',
  4: 'Audio Codec',
  5: 'Audio Streams',
  6: 'Subtitle Streams',
  7: 'Version',
  8: 'Chaptered',
  9: 'Censored',
  10: 'Creditless',
  11: 'Corrupted',
  12: 'Sub Group',
};

const ALL_SIGNALS = Object.keys(SIGNAL_NAMES).map(Number);

type Props = {
  preferences: ReleaseComparisonPreferencesType;
  onChange: (updated: ReleaseComparisonPreferencesType) => void;
};

const InfoIcon = ({ tooltip }: { tooltip: string }) => (
  <Icon
    path={mdiInformationVariantCircleOutline}
    size={0.75}
    className="ml-1 shrink-0 opacity-65"
    data-tooltip-id="tooltip"
    data-tooltip-content={tooltip}
  />
);

const ReleaseManagementSettings = ({ onChange, preferences }: Props) => {
  const set = <K extends keyof ReleaseComparisonPreferencesType>(
    key: K,
    value: ReleaseComparisonPreferencesType[K],
  ) => onChange({ ...preferences, [key]: value });

  const orderedSignals = preferences.SignalPriority.length > 0
    ? preferences.SignalPriority
    : [...ALL_SIGNALS];

  const handleSignalReorder = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const newOrder = [...orderedSignals];
    const [moved] = newOrder.splice(result.source.index, 1);
    newOrder.splice(result.destination.index, 0, moved);
    set('SignalPriority', newOrder);
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Deletion</div>

        <Checkbox
          id="rm-auto-delete-on-import"
          isChecked={preferences.AutoDeleteOnImport}
          onChange={event => set('AutoDeleteOnImport', event.target.checked)}
          justify
          label={(
            <span className="flex items-center">
              Auto Delete on Import
              <InfoIcon tooltip="Automatically delete redundant files when a higher-ranked release is imported." />
            </span>
          )}
        />

        <Checkbox
          id="rm-per-file-deletion-airing"
          isChecked={preferences.PerFileDeletionForAiringSeries}
          onChange={event => set('PerFileDeletionForAiringSeries', event.target.checked)}
          justify
          label={(
            <span className="flex items-center">
              Per-file Deletion for Airing Series
              <InfoIcon tooltip="For airing series, delete individual redundant files rather than whole candidates. Files covering episodes not yet in the primary candidate are kept." />
            </span>
          )}
        />
      </div>

      <div className="border-t border-panel-border" />

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Quality Preferences</div>

        <div className="flex items-center justify-between">
          <span className="flex items-center">
            Episode Type Scope
            <InfoIcon tooltip="Controls how releases covering different episode types (regular vs. specials) are ranked. 'All Together' treats them as one unit; 'Per Episode Type' ranks them independently." />
          </span>
          <Select
            id="rm-episode-type-scope"
            value={preferences.EpisodeTypeScope}
            onChange={event => set('EpisodeTypeScope', Number(event.target.value))}
            className="w-52"
          >
            <option value={0}>All Together</option>
            <option value={1}>Per Episode Type</option>
          </Select>
        </div>
      </div>

      <div className="border-t border-panel-border" />

      <div className="flex flex-col gap-y-2">
        <div className="flex items-center font-semibold">
          Signal Priority
          <InfoIcon tooltip="Drag to reorder the quality signals used to rank candidates. Comparison stops at the first signal where candidates differ." />
          <span className="ml-2 text-xs font-normal opacity-65">(Drag to Reorder)</span>
        </div>

        <div className="flex min-h-10 flex-col rounded-lg border border-panel-border bg-panel-input p-4">
          <DnDList onDragEnd={handleSignalReorder}>
            {orderedSignals.map(signal => ({
              key: String(signal),
              item: (
                <div className="flex cursor-grab items-center gap-x-2 py-1 active:cursor-grabbing">
                  <Icon path={mdiDragHorizontalVariant} size={0.8333} className="shrink-0 opacity-50" />
                  <span className="text-sm">{SIGNAL_NAMES[signal] ?? `Signal ${signal}`}</span>
                </div>
              ),
            }))}
          </DnDList>
        </div>

      </div>

      <div className="border-t border-panel-border" />

      <div className="flex flex-col gap-y-4">
        <div className="text-xs opacity-65">Enter values comma-separated, most preferred first. Leave empty to use server defaults.</div>

        <Checkbox
          id="rm-prefer-higher-bit-depth"
          isChecked={preferences.PreferHigherBitDepth}
          onChange={event => set('PreferHigherBitDepth', event.target.checked)}
          justify
          label={(
            <span className="flex items-center">
              Prefer Higher Bit Depth
              <InfoIcon tooltip="Prefer 10-bit video over 8-bit when ranking candidates. Disable to prefer 8-bit." />
            </span>
          )}
        />

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm">
            Source Order
            <InfoIcon tooltip="Preferred source order (e.g. Blu-ray,WEB,DVD). First entry is most preferred." />
          </span>
          <InputSmall
            id="rm-source-order"
            type="text"
            value={preferences.SourceOrder.join(',')}
            onChange={event => set('SourceOrder', event.target.value ? event.target.value.split(',') : [])}
            className="w-52 px-3 py-1"
            placeholder="Blu-ray,WEB,DVD"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm">
            Resolution Order
            <InfoIcon tooltip="Preferred resolution order (e.g. 1080p,720p,480p). First entry is most preferred." />
          </span>
          <InputSmall
            id="rm-resolution-order"
            type="text"
            value={preferences.ResolutionOrder.join(',')}
            onChange={event => set('ResolutionOrder', event.target.value ? event.target.value.split(',') : [])}
            className="w-52 px-3 py-1"
            placeholder="1080p,720p,480p"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm">
            Video Codec Order
            <InfoIcon tooltip="Preferred video codec order (e.g. HEVC,AVC,MPEG-2). First entry is most preferred." />
          </span>
          <InputSmall
            id="rm-video-codec-order"
            type="text"
            value={preferences.VideoCodecOrder.join(',')}
            onChange={event => set('VideoCodecOrder', event.target.value ? event.target.value.split(',') : [])}
            className="w-52 px-3 py-1"
            placeholder="HEVC,AVC"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm">
            Audio Codec Order
            <InfoIcon tooltip="Preferred audio codec order (e.g. FLAC,AAC,MP3). First entry is most preferred." />
          </span>
          <InputSmall
            id="rm-audio-codec-order"
            type="text"
            value={preferences.AudioCodecOrder.join(',')}
            onChange={event => set('AudioCodecOrder', event.target.value ? event.target.value.split(',') : [])}
            className="w-52 px-3 py-1"
            placeholder="FLAC,AAC,MP3"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center text-sm">
            Sub Group Order
            <InfoIcon tooltip="Preferred release group order. First entry is most preferred. Leave empty for no group preference." />
          </span>
          <InputSmall
            id="rm-sub-group-order"
            type="text"
            value={preferences.SubGroupOrder.join(',')}
            onChange={event => set('SubGroupOrder', event.target.value ? event.target.value.split(',') : [])}
            className="w-52 px-3 py-1"
            placeholder="SubsPlease,Erai-raws"
          />
        </div>
      </div>
    </div>
  );
};

export default ReleaseManagementSettings;
