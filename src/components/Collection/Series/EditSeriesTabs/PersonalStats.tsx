import React from 'react';

import Checkbox from '@/components/Input/Checkbox';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';

// TODO: This one is mocked, we need to get the data from the API
function PersonalStats() {
  const watchedState = {
    episodes: {
      current: 5,
      total: 10,
    },
    specials: {
      current: 4,
      total: 10,
    },
  };

  const seriesScore = {
    isGlobal: true,
    anidb: 5,
    anilist: 4,
    animeshon: 2,
    mal: 4,
  };

  return (
    <div className="flex flex-col gap-y-8">
      <div className="flex flex-col gap-y-4">
        <div className="border-b border-panel-border pb-4 font-semibold">Watched State</div>
        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between transition-opacity">
            <span>Episodes</span>
            <div className="flex items-center gap-x-2">
              <InputSmall
                id="current-episodes"
                className="w-12 px-3 py-1"
                type="number"
                onChange={(_) => {}}
                value={watchedState.episodes.current}
                suffixes={
                  <div className="flex items-center gap-x-1 text-sm">
                    <span>/</span>
                    <span>{watchedState.episodes.total}</span>
                  </div>
                }
              />
            </div>
          </div>
          <div className="flex justify-between transition-opacity">
            <span>Specials</span>
            <div className="flex items-center gap-x-2">
              <InputSmall
                id="current-episodes"
                className="w-12 px-3 py-1"
                type="number"
                onChange={(_) => {}}
                value={watchedState.specials.current}
                suffixes={
                  <div className="flex items-center gap-x-1 text-sm">
                    <span>/</span>
                    <span>{watchedState.specials.total}</span>
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-y-4">
        <div className="border-b border-panel-border pb-4 font-semibold">Series Score</div>
        <div className="flex flex-col gap-2">
          <Checkbox
            justify
            label="Set Score Globally"
            id="total-episodes"
            isChecked={seriesScore.isGlobal}
            onChange={(_) => {}}
          />
          <div className="flex items-center justify-between">
            <span>AniDB</span>
            <SelectSmall
              id="anidb-score"
              value={seriesScore.anidb}
              onChange={(_) => {}}
            >
              {[...Array(11).keys()].map(i => <option key={i}>{i}</option>)}
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>AniList</span>
            <SelectSmall
              id="anilist-score"
              value={seriesScore.anilist}
              onChange={(_) => {}}
            >
              {[...Array(11).keys()].map(i => <option key={i}>{i}</option>)}
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>Animeshon</span>
            <SelectSmall
              id="animeshon-score"
              value={seriesScore.animeshon}
              onChange={(_) => {}}
            >
              <option value={1}>Not Set</option>
              <option value={2}>Recommend</option>
              <option value={3}>Not Recommend</option>
            </SelectSmall>
          </div>
          <div className="flex items-center justify-between">
            <span>My Anime List</span>
            <SelectSmall
              id="anilist-score"
              value={seriesScore.mal}
              onChange={(_) => {}}
            >
              {[...Array(11).keys()].map(i => <option key={i}>{i}</option>)}
            </SelectSmall>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalStats;
