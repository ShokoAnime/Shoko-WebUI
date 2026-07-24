import cx from 'classnames';

import type { ReleaseCandidateType } from '@/core/types/api/release-management';

type Props = {
  candidate: ReleaseCandidateType;
};

const parseMixedFlag = (
  isMixed: boolean,
  trueLabel: string,
  falseLabel: string,
  value?: boolean,
): string => {
  if (value == null) return 'N/A';
  if (isMixed) return value ? `Mostly ${trueLabel}` : `Mostly ${falseLabel}`;
  return value ? 'Yes' : 'No';
};

const CandidateCardSignals = ({ candidate }: Props) => (
  <div className="flex flex-col gap-y-1">
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm sm:grid-cols-3 lg:grid-cols-4">
      <div>
        Source:&nbsp;
        <span className="font-semibold">{candidate.Source ?? 'Unknown'}</span>
      </div>
      <div>
        Resolution:&nbsp;
        <span className="font-semibold">{candidate.Resolution ?? 'Unknown'}</span>
      </div>
      <div>
        Video:&nbsp;
        <span className="font-semibold">{candidate.VideoCodec ?? 'Unknown'}</span>
      </div>
      <div>
        Bit Depth:&nbsp;
        <span className="font-semibold">
          {candidate.BitDepth > 0 ? `${candidate.BitDepth}-bit` : 'Unknown'}
        </span>
      </div>
      <div>
        Audio:&nbsp;
        <span className="font-semibold">{candidate.AudioCodec ?? 'Unknown'}</span>
      </div>
      <div>
        Audio Streams:&nbsp;
        <span className="font-semibold">{candidate.AudioStreamCount}</span>
      </div>
      <div>
        Subtitle Streams:&nbsp;
        <span className="font-semibold">{candidate.SubtitleStreamCount}</span>
      </div>
      <div>
        Version:&nbsp;
        <span className="font-semibold">
          v
          {candidate.Version > 0 ? candidate.Version : 1}
        </span>
      </div>
      <div>
        Chaptered:&nbsp;
        <span className="font-semibold">
          {parseMixedFlag(candidate.IsChapteredMixed, 'Chaptered', 'Unchaptered', candidate.IsChaptered)}
        </span>
      </div>
      <div>
        Censored:&nbsp;
        <span
          className={cx(
            'font-semibold',
            candidate.IsCensored && !candidate.IsCensoredMixed && 'text-panel-text-warning',
          )}
        >
          {parseMixedFlag(candidate.IsCensoredMixed, 'Censored', 'Uncensored', candidate.IsCensored)}
        </span>
      </div>
      <div>
        Creditless:&nbsp;
        <span className="font-semibold">
          {parseMixedFlag(candidate.IsCreditlessMixed, 'Creditless', 'Not Creditless', candidate.IsCreditless)}
        </span>
      </div>
      {candidate.IsCorrupted && <div className="font-semibold text-panel-text-danger">Corrupted</div>}
    </div>

    {((candidate.AudioLanguages?.length ?? 0) > 0 || (candidate.SubtitleLanguages?.length ?? 0) > 0) && (
      <div className="grid grid-cols-2 gap-x-6 text-sm">
        {(candidate.AudioLanguages?.length ?? 0) > 0 && (
          <div>
            Audio Languages:&nbsp;
            <span className="font-semibold">{candidate.AudioLanguages!.join(', ')}</span>
          </div>
        )}
        {(candidate.SubtitleLanguages?.length ?? 0) > 0 && (
          <div>
            Subtitle Languages:&nbsp;
            <span className="font-semibold">{candidate.SubtitleLanguages!.join(', ')}</span>
          </div>
        )}
      </div>
    )}
  </div>
);

export default CandidateCardSignals;
