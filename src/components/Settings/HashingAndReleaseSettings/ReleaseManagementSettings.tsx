import React from 'react';
import { mdiDragHorizontalVariant } from '@mdi/js';
import { Icon } from '@mdi/react';

import DnDList from '@/components/DnDList/DnDList';
import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';

import type { ReleaseComparisonPreferencesType, SignalType } from '@/core/types/api/settings';
import type { DropResult } from '@hello-pangea/dnd';

const SIGNAL_NAMES: Record<SignalType, string> = {
  Source: 'Source',
  Resolution: 'Resolution',
  VideoCodec: 'Video Codec',
  BitDepth: 'Bit Depth',
  AudioCodec: 'Audio Codec',
  AudioStreams: 'Audio Streams',
  SubtitleStreams: 'Subtitle Streams',
  Version: 'Version',
  Chaptered: 'Chaptered',
  Censored: 'Censored',
  Creditless: 'Creditless',
  Corrupted: 'Corrupted',
  SubGroup: 'Sub Group',
};

const ALL_SIGNALS = Object.keys(SIGNAL_NAMES) as SignalType[];

type Props = {
  preferences: ReleaseComparisonPreferencesType;
  onChange: (updated: ReleaseComparisonPreferencesType) => void;
};

const ReleaseManagementSettings = ({ onChange, preferences }: Props) => {
  const updateSetting = <K extends keyof ReleaseComparisonPreferencesType>(
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
    updateSetting('SignalPriority', newOrder);
  };

  return (
    <div className="flex flex-col gap-y-6">
      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Deletion</div>

        <div className="flex flex-col">
          <Checkbox
            id="rm-auto-delete-on-import"
            isChecked={preferences.AutoDeleteOnImport}
            onChange={event => updateSetting('AutoDeleteOnImport', event.target.checked)}
            justify
            label="Auto Delete on Import"
          />
          <div className="text-xs opacity-65">
            Automatically delete redundant files when a higher-ranked release is imported.
          </div>
        </div>

        <div className="flex flex-col">
          <Checkbox
            id="rm-per-file-deletion-airing"
            isChecked={preferences.PerFileDeletionForAiringSeries}
            onChange={event => updateSetting('PerFileDeletionForAiringSeries', event.target.checked)}
            justify
            label="Per-file Deletion for Airing Series"
          />
          <div className="text-xs opacity-65">
            For airing series, delete individual redundant files rather than whole candidates. Files covering episodes
            not yet in the primary candidate are kept.
          </div>
        </div>
      </div>

      <div className="border-t border-panel-border" />

      <div className="flex flex-col gap-y-2">
        <div className="font-semibold">Quality Preferences</div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>Episode Type Scope</span>
            <SelectSmall
              id="rm-episode-type-scope"
              value={preferences.EpisodeTypeScope}
              onChange={event =>
                updateSetting('EpisodeTypeScope', event.target.value as 'AllTogether' | 'PerEpisodeType')}
              className="w-52"
            >
              <option value="AllTogether">All Together</option>
              <option value="PerEpisodeType">Per Episode Type</option>
            </SelectSmall>
          </div>
          <div className="text-xs opacity-65">
            Controls how releases covering different episode types (regular vs. specials) are ranked. &apos;All
            Together&apos; treats them as one unit; &apos;Per Episode Type&apos; ranks them independently.
          </div>
        </div>
      </div>

      <div className="border-t border-panel-border" />

      <div className="flex flex-col gap-y-2">
        <div className="flex flex-col gap-y-1">
          <div className="flex items-center font-semibold">
            Signal Priority
            <span className="ml-2 text-xs font-normal opacity-65">(Drag to Reorder)</span>
          </div>
          <div className="text-xs opacity-65">
            Drag to reorder the quality signals used to rank candidates. Comparison stops at the first signal where
            candidates differ.
          </div>
        </div>

        <div className="flex min-h-10 flex-col rounded-lg border border-panel-border bg-panel-input p-4">
          <DnDList onDragEnd={handleSignalReorder}>
            {orderedSignals.map(signal => ({
              key: signal,
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
        <div className="text-xs opacity-65">
          Enter values comma-separated, most preferred first. Leave empty to use server defaults.
        </div>

        <div className="flex flex-col">
          <Checkbox
            id="rm-prefer-higher-bit-depth"
            isChecked={preferences.PreferHigherBitDepth}
            onChange={event => updateSetting('PreferHigherBitDepth', event.target.checked)}
            justify
            label="Prefer Higher Bit Depth"
          />
          <div className="text-xs opacity-65">
            Prefer 10-bit video over 8-bit when ranking candidates. Disable to prefer 8-bit.
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>Source Order</span>
            <InputSmall
              id="rm-source-order"
              type="text"
              value={preferences.SourceOrder.join(',')}
              onChange={event => updateSetting('SourceOrder', event.target.value ? event.target.value.split(',') : [])}
              className="w-52 px-3 py-1"
              placeholder="Blu-ray,WEB,DVD"
            />
          </div>
          <div className="text-xs opacity-65">
            Preferred source order (e.g. Blu-ray,WEB,DVD). First entry is most preferred.
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>Resolution Order</span>
            <InputSmall
              id="rm-resolution-order"
              type="text"
              value={preferences.ResolutionOrder.join(',')}
              onChange={event =>
                updateSetting('ResolutionOrder', event.target.value ? event.target.value.split(',') : [])}
              className="w-52 px-3 py-1"
              placeholder="1080p,720p,480p"
            />
          </div>
          <div className="text-xs opacity-65">
            Preferred resolution order (e.g. 1080p,720p,480p). First entry is most preferred.
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>Video Codec Order</span>
            <InputSmall
              id="rm-video-codec-order"
              type="text"
              value={preferences.VideoCodecOrder.join(',')}
              onChange={event =>
                updateSetting('VideoCodecOrder', event.target.value ? event.target.value.split(',') : [])}
              className="w-52 px-3 py-1"
              placeholder="HEVC,AVC"
            />
          </div>
          <div className="text-xs opacity-65">
            Preferred video codec order (e.g. HEVC,AVC,MPEG-2). First entry is most preferred.
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>Audio Codec Order</span>
            <InputSmall
              id="rm-audio-codec-order"
              type="text"
              value={preferences.AudioCodecOrder.join(',')}
              onChange={event =>
                updateSetting('AudioCodecOrder', event.target.value ? event.target.value.split(',') : [])}
              className="w-52 px-3 py-1"
              placeholder="FLAC,AAC,MP3"
            />
          </div>
          <div className="text-xs opacity-65">
            Preferred audio codec order (e.g. FLAC,AAC,MP3). First entry is most preferred.
          </div>
        </div>

        <div className="flex flex-col gap-y-1">
          <div className="flex items-center justify-between">
            <span>Sub Group Order</span>
            <InputSmall
              id="rm-sub-group-order"
              type="text"
              value={preferences.SubGroupOrder.join(',')}
              onChange={event =>
                updateSetting('SubGroupOrder', event.target.value ? event.target.value.split(',') : [])}
              className="w-52 px-3 py-1"
              placeholder="SubsPlease,Erai-raws"
            />
          </div>
          <div className="text-xs opacity-65">
            Preferred release group order. First entry is most preferred. Leave empty for no group preference.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseManagementSettings;
