import { chunk } from 'lodash';

import type { SeasonAnimeType, SeasonSectionType } from '@/core/types/api/airing-season';

/** A row of the season view's virtual list: a section's title, or a row of its cards. */
export type SeasonGridRowType =
  | { type: 'title', key: string, section: SeasonSectionType }
  | { type: 'cards', key: string, anime: SeasonAnimeType[], isSectionEnd: boolean };

/** The columns a grid has at the width: one, and one more for each of the widths, ascending, it reaches. */
export const getGridColumnCount = (width: number, thresholds: number[]) =>
  1 + thresholds.filter(threshold => width >= threshold).length;

/**
 * How many rows of cards the season view's skeleton has, so its anime pane is never shorter: enough to fill the scroll
 * container's view and one more, and at least five.
 */
export const getSkeletonRowCount = (viewHeight: number, rowHeight: number) =>
  Math.max(5, Math.ceil(viewHeight / rowHeight) + 1);

/**
 * The sections as one list of rows: each section's title, then its cards, `columns` to a row. The empty sections are
 * left out; each section is keyed by its place in the layout.
 */
export const getSeasonGridRows = (sections: SeasonSectionType[], columns: number): SeasonGridRowType[] =>
  sections.flatMap((section, sectionIndex) => {
    if (section.Anime.length === 0) return [];
    const rows = chunk(section.Anime, columns);
    return [
      { type: 'title', key: `title-${sectionIndex}`, section } as const,
      ...rows.map((anime, index) => ({
        type: 'cards',
        key: `cards-${sectionIndex}-${index}`,
        anime,
        isSectionEnd: index === rows.length - 1,
      } as const)),
    ];
  });
