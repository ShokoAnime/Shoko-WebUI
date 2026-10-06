import { mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import Select from '@/components/Input/Select';
import ModalPanel from '@/components/Panels/ModalPanel';
import { useResetStartSeasonMutation, useSetStartSeasonMutation } from '@/core/react-query/airing-schedule/mutations';
import { useStartSeasonQuery } from '@/core/react-query/airing-schedule/queries';
import toast from '@/core/toast';
import { isSameSeason, seasonKeyToString, seasonOrder } from '@/core/utilities/season';
import { getStartSeasonKey, isValidStartSeasonYear, startSeasonYearRange } from '@/core/utilities/startSeason';
import useSyncedState from '@/hooks/useSyncedState';

import type { SeasonAnimeType } from '@/core/types/api/airing-season';
import type { SeasonKey, YearlySeasonValues } from '@/core/utilities/season';

type Props = {
  /** The anime to move; the modal is shown while it is set. */
  anime: SeasonAnimeType | null;
  /** The season being viewed, which the pickers open on when the anime has no start season. */
  season: SeasonKey;
  onClose: () => void;
};

/**
 * Moves an anime to another season through `PUT Series/AniDB/{anidbID}/StartSeason`, or back to the season its dates
 * give through `DELETE`. Saved at once; admin only.
 */
const StartSeasonModal = ({ anime: openedAnime, onClose, season }: Props) => {
  // The last anime opened, so the modal keeps its content while it closes.
  const [anime] = useSyncedState(openedAnime, (next, prev) => next ?? prev ?? null);
  const startSeasonQuery = useStartSeasonQuery(anime?.ID ?? 0, !!openedAnime);
  const startSeason = openedAnime ? startSeasonQuery.data : undefined;
  const fallback = anime?.StartSeason
    ? { year: anime.StartSeason.Year, season: anime.StartSeason.AnimeSeason }
    : season;
  // Starts over from the anime's start season each time the modal opens, and keeps the pick while it closes.
  const [draft, setDraft] = useSyncedState(
    startSeason,
    (next, prev?: { year: string, season: YearlySeasonValues }) => {
      if (!next) return prev ?? { year: `${fallback.year}`, season: fallback.season };
      const key = getStartSeasonKey(next, fallback);
      return { year: `${key.year}`, season: key.season };
    },
  );

  const { isPending: isSaving, mutate: setStartSeason } = useSetStartSeasonMutation();
  const { isPending: isResetting, mutate: resetStartSeason } = useResetStartSeasonMutation();
  const isPending = isSaving || isResetting;

  const picked = { year: Number(draft.year), season: draft.season };
  const current = startSeasonQuery.data ? getStartSeasonKey(startSeasonQuery.data, fallback) : null;
  const canSave = !!current && isValidStartSeasonYear(picked.year) && !isSameSeason(picked, current);
  const computed = startSeasonQuery.data?.Computed;

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSave = () => {
    if (!anime || !canSave) return;
    setStartSeason({ anidbId: anime.ID, value: { Year: picked.year, Season: picked.season } }, {
      onSuccess: () => {
        toast.success('Start season saved!', `${anime.Title} moved to ${seasonKeyToString(picked)}.`);
        onClose();
      },
    });
  };

  const handleReset = () => {
    if (!anime) return;
    resetStartSeason(anime.ID, {
      onSuccess: () => {
        toast.success('Start season reset!', `${anime.Title} is back in the season its dates give.`);
        onClose();
      },
    });
  };

  return (
    <ModalPanel show={!!openedAnime} onRequestClose={handleClose} header="Move to Season" size="sm">
      {anime && (
        <div className="flex flex-col gap-y-1">
          <div className="font-semibold">{anime.Title}</div>
          <div className="text-sm opacity-65">
            The season the anime is listed in, in the season view and the season browser. Saved at once.
          </div>
        </div>
      )}
      {startSeasonQuery.isPending && (
        <Icon
          path={mdiLoading}
          size={2}
          spin
          className="m-auto text-panel-text-primary"
        />
      )}
      {startSeasonQuery.data && (
        <>
          {startSeasonQuery.data.IsOverridden && (
            <div className="text-sm">
              Moved by hand.
              {computed
                ? ` Its dates put it in ${seasonKeyToString({ year: computed.Year, season: computed.Season })}.`
                : ' It has no dates to go by.'}
            </div>
          )}
          <div className="flex items-center gap-x-2">
            <Select
              id="start-season-season"
              value={draft.season}
              onChange={event => setDraft({ ...draft, season: event.target.value as YearlySeasonValues })}
              className="grow"
            >
              {seasonOrder.map(item => <option key={item} value={item}>{item}</option>)}
            </Select>
            <Input
              id="start-season-year"
              type="number"
              value={draft.year}
              onChange={event => setDraft({ ...draft, year: event.target.value })}
              onKeyUp={event => event.key === 'Enter' && handleSave()}
              className="w-32"
            />
          </div>
          {draft.year !== '' && !isValidStartSeasonYear(picked.year) && (
            <div className="text-sm text-panel-text-danger">
              {`The year runs from ${startSeasonYearRange.min} to ${startSeasonYearRange.max}.`}
            </div>
          )}
        </>
      )}
      <div className="flex justify-between gap-x-3 font-semibold">
        <div>
          {startSeasonQuery.data?.IsOverridden && (
            <Button
              onClick={handleReset}
              buttonType="secondary"
              className="px-5 py-2"
              disabled={isSaving}
              loading={isResetting}
            >
              Reset to Computed
            </Button>
          )}
        </div>
        <div className="flex gap-x-3">
          <Button onClick={handleClose} buttonType="secondary" className="px-5 py-2" disabled={isPending}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            buttonType="primary"
            className="px-5 py-2"
            disabled={!canSave || isResetting}
            loading={isSaving}
          >
            Save
          </Button>
        </div>
      </div>
    </ModalPanel>
  );
};

export default StartSeasonModal;
