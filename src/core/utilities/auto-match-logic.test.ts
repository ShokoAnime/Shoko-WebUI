import { describe, expect, test } from 'vitest';

import { detectShow } from './auto-match-logic';
import { Crc32Regex } from './auto-match-regexes';

import type { EpisodeTypeValues } from '@/core/types/api/episode';

type Expected = Partial<{
  showName: string;
  season: number | null;
  episodeStart: number;
  episodeEnd: number;
  episodeType: EpisodeTypeValues;
  releaseGroup: string | null;
  version: number | null;
}>;

type MatchCase = {
  path: string;
  // The rule that must win this path. Asserting it catches reorder / new-rule
  // regressions that a value-only check would miss.
  rule: string;
  expected: Expected;
  // Set for shapes detectShow does not handle well yet. The assertion still runs
  // against current output so a change here is visible; flip the comment when fixed.
  knownGap?: string;
};

const cases: MatchCase[] = [
  // --- default: the common fansub / scene shapes ---
  {
    path: '[SubsPlease] Sousou no Frieren - 12 (1080p) [9A1B5C3D].mkv',
    rule: 'default',
    expected: {
      showName: 'Sousou no Frieren',
      episodeStart: 12,
      episodeEnd: 12,
      episodeType: 'Episode',
      releaseGroup: 'SubsPlease',
    },
  },
  {
    path: '[Erai-raws] Sousou no Frieren - 05 [1080p][Multiple Subtitle][A1B2C3D4].mkv',
    rule: 'default',
    expected: { showName: 'Sousou no Frieren', episodeStart: 5, releaseGroup: 'Erai-raws' },
  },
  {
    path: '[HorribleSubs] Show Name - 100 [720p].mkv',
    rule: 'default',
    expected: { showName: 'Show Name', episodeStart: 100, releaseGroup: 'HorribleSubs' },
  },
  {
    path: '[Beatrice-Raws] Kimetsu no Yaiba 19 [1920x1080 HEVC BDRip FLAC].mkv',
    rule: 'default',
    expected: { showName: 'Kimetsu no Yaiba', episodeStart: 19, releaseGroup: 'Beatrice-Raws' },
  },
  {
    path: '[Group] Show Name - 05v2 [1080p].mkv',
    rule: 'default',
    expected: { showName: 'Show Name', episodeStart: 5, version: 2 },
  },
  {
    path: '[Group] Show Name - 05-06 [1080p].mkv',
    rule: 'default',
    expected: { showName: 'Show Name', episodeStart: 5, episodeEnd: 6, episodeType: 'Episode' },
  },
  {
    path: '[Group] Show Name - 05.5 [1080p].mkv',
    rule: 'default',
    expected: { showName: 'Show Name', episodeStart: 0, episodeEnd: 0, episodeType: 'Special' },
  },
  {
    path: '[Group] Show Name - OP2 [1080p].mkv',
    rule: 'default',
    expected: { showName: 'Show Name', episodeStart: 2, episodeType: 'Credits' },
  },
  {
    path: '[Group] Show Name - SP1 [1080p].mkv',
    rule: 'default',
    expected: { showName: 'Show Name', episodeStart: 1, episodeType: 'Special' },
  },
  {
    path: '[Group] Show Name S2 - 05 [1080p].mkv',
    rule: 'default',
    expected: { showName: 'Show Name S2', season: 2, episodeStart: 5 },
  },
  {
    path: 'Show.Name.S01E01-E02.1080p.WEB.h264-GRP.mkv',
    rule: 'default',
    expected: { showName: 'Show Name', season: 1, episodeStart: 1, episodeEnd: 2 },
  },

  // --- trash-anime: Sonarr anime format "Show - SxxExx - <absolute> - <title> [..]" ---
  {
    path: 'Bleach Thousand-Year Blood War - S02E08 - 021 - The Blade [WEBDL-1080p][x264]-GRP.mkv',
    rule: 'trash-anime',
    expected: { showName: 'Bleach Thousand-Year Blood War S2', season: 2, episodeStart: 8, releaseGroup: 'GRP' },
  },
  {
    path: 'Frieren Beyond Journey\'s End - S01E05 - 005 - The Land Where Souls Rest [HDTV-1080p][x264].mkv',
    rule: 'trash-anime',
    expected: { showName: 'Frieren Beyond Journey\'s End', season: 1, episodeStart: 5 },
  },
  {
    path: 'Show (2020) - S00E01 - 12 - Special Title [1080p].mkv',
    rule: 'trash-anime',
    expected: { showName: 'Show', episodeStart: 1, episodeType: 'Special' },
  },
  {
    path: 'Show - S01E05 - 005 - Title [Bluray-1080p].mkv',
    rule: 'trash-anime',
    expected: { showName: 'Show', season: 1, episodeStart: 5 },
  },

  // --- marker-first: "[Group] SxxExx - Show Name [..]" ---
  {
    path: '[Group] S03E05 - Kaguya-sama Love Is War (2019) [1080p].mkv',
    rule: 'marker-first',
    expected: { showName: 'Kaguya-sama Love Is War', season: 3, episodeStart: 5, releaseGroup: 'Group' },
  },
  {
    path: '[EMBER] S01E05 - Frieren Beyond Journey\'s End [1080p] [HEVC].mkv',
    rule: 'marker-first',
    expected: { showName: 'Frieren Beyond Journey\'s End', season: 1, episodeStart: 5, releaseGroup: 'EMBER' },
  },
  {
    path: '[EMBER] S00E01 - Show Name Special [1080p].mkv',
    rule: 'marker-first',
    expected: { showName: 'Show Name Special', episodeStart: 1, episodeType: 'Special', releaseGroup: 'EMBER' },
  },

  // --- trailing-native-title: web-dl with a native/romaji title after the codec ---
  {
    path:
      'Clevatess S02E09 REPACK 1080p CR WEB-DL Dual-Audio DDP 2.0 H.264  Clevatess II - Majuu no Ou to Itsuwari no Yuusha Denshou.mkv',
    rule: 'trailing-native-title',
    expected: { showName: 'Clevatess S2', season: 2, episodeStart: 9 },
  },
  {
    path: '[AnoZu] The Villager of Level 999 2026 S01E11 1080p CR WEB-DL AAC 2.0 H.264 Lv999 no Murabito.mkv',
    rule: 'trailing-native-title',
    expected: { showName: 'The Villager of Level 999', season: 1, episodeStart: 11, releaseGroup: 'AnoZu' },
  },
  {
    path: 'Kanojo.mo.Kanojo.S02E01.1080p.CR.WEB-DL.AAC2.0.H.264.mkv',
    rule: 'trailing-native-title',
    expected: { showName: 'Kanojo mo Kanojo S2', season: 2, episodeStart: 1 },
  },
  {
    path:
      'Skeleton Knight in Another World S01E01 1080p CR WEB-DL AAC 2.0 H.264  Gaikotsu Kishi-sama Tadaima Isekai e Odekake-chuu.mkv',
    rule: 'trailing-native-title',
    expected: { showName: 'Skeleton Knight in Another World', season: 1, episodeStart: 1 },
  },

  // --- raws-1/2/3: name with a trailing "-Group" ---
  {
    path: 'Show Name 05 1920x1080 -Group.mkv',
    rule: 'raws-1',
    expected: { showName: 'Show Name', episodeStart: 5, releaseGroup: 'Group' },
  },
  {
    path: 'Show.Name.S01E05.1080p.WEB.h264-GRP.mkv',
    rule: 'raws-2',
    expected: { showName: 'Show Name', season: 1, episodeStart: 5, releaseGroup: 'GRP' },
  },
  {
    path: 'Show Name S01E01 [1080p] [AAC]-Beatrice.mkv',
    rule: 'raws-3',
    expected: { showName: 'Show Name', season: 1, episodeStart: 1, releaseGroup: 'Beatrice' },
  },

  // --- brackets / foreign / fallback ---
  {
    path: '[Group][Show Name][2019][01][1080p].mkv',
    rule: 'brackets-1',
    expected: { showName: 'Show Name', episodeStart: 1, releaseGroup: 'Group' },
  },
  {
    path: '[Group][Show Name][05][1080p].mkv',
    rule: 'brackets-2',
    expected: { showName: 'Show Name', episodeStart: 5, releaseGroup: 'Group' },
  },
  {
    path: 'Show Name - 05 「Episode Title」 (1080p x264).mkv',
    rule: 'foreign-1',
    expected: { showName: 'Show Name', episodeStart: 5 },
  },
  {
    path: 'Some Movie (2019).mkv',
    rule: 'fallback',
    expected: { showName: 'Some Movie (2019)', episodeStart: 1, episodeEnd: 1 },
  },

  // --- reversed-1: episode number before the title ---
  {
    path: '05 - Show Name [1080p].mkv',
    rule: 'reversed-1',
    expected: { showName: 'Show Name', episodeStart: 5, episodeEnd: 5 },
  },
  {
    path: '05 - Show Name.mkv',
    rule: 'reversed-1',
    expected: { showName: 'Show Name', episodeStart: 5 },
  },
  {
    path: '[05] - Show Name [1080p].mkv',
    rule: 'reversed-1',
    expected: { showName: 'Show Name', episodeStart: 5 },
  },
  {
    path: '100 - Long Runner [1080p].mkv',
    rule: 'reversed-1',
    expected: { showName: 'Long Runner', episodeStart: 100 },
  },
  {
    // 4-digit leading number is a year, not an episode - must not be caught by reversed-1.
    path: '2001 - A Space Odyssey.mkv',
    rule: 'fallback',
    expected: { showName: '2001- A Space Odyssey', episodeStart: 1 },
  },

  // --- theme-song episode type via defaultTransform (rules with no isThemeSong group) ---
  {
    path: 'Show Name S01E05 1080p WEB NCED.mkv',
    rule: 'trailing-native-title',
    expected: { showName: 'Show Name', season: 1, episodeStart: 1, episodeType: 'Credits' },
  },
  {
    path: 'Show.Name.S01E05.1080p.WEB.NCED.mkv',
    rule: 'trailing-native-title',
    expected: { showName: 'Show Name', season: 1, episodeStart: 1, episodeType: 'Credits' },
  },
  {
    // no theme token in the path - stays a normal episode.
    path: 'Show Name S01E05 1080p CR WEB-DL AAC H.264  Native Title.mkv',
    rule: 'trailing-native-title',
    expected: { showName: 'Show Name', season: 1, episodeStart: 5, episodeType: 'Episode' },
  },
  {
    // a bare "op"/"ed" inside a title word must not trigger the theme block.
    path: 'Cop Craft - 05 [1080p].mkv',
    rule: 'default',
    expected: { showName: 'Cop Craft', episodeStart: 5, episodeType: 'Episode' },
  },

  // --- known gaps: asserted against current output so a change is visible ---
  {
    path: '[Judas] Fairy Tail (2014) 003 Fairy Tactician (1080p HEVC 10bit BluRay) [DUAL-AUDIO] [751BB414].mkv',
    rule: 'fallback',
    expected: { showName: 'Fairy Tail (2014) 003 Fairy Tactician', episodeStart: 1 },
    knownGap: 'space-delimited "NNN Title" after the year is not split; episode should be 3',
  },
  {
    path: '[Judas] Fairy Tail (2014) C19 Ending 4d (1080p HEVC 10bit BluRay) [D1DE9D43].mkv',
    rule: 'fallback',
    expected: { showName: 'Fairy Tail (2014) C19 Ending 4d', episodeStart: 1 },
    knownGap: 'dotless "C19" credit marker not recognised; should be Credits ep 19',
  },
];

const rejected = [
  '2024-01-02 15.04.05.mkv',
  '2024.01.02T15.04.05.mp4',
  'random garbage no episode here',
  '',
];

describe('detectShow', () => {
  test.each(cases)('$path', ({ expected, path, rule }) => {
    const result = detectShow(path);
    expect(result, 'expected a match').not.toBeNull();
    expect(result!.ruleName).toBe(rule);
    expect(result).toMatchObject(expected);
  });

  test.each(rejected)('rejects %j', (path) => {
    expect(detectShow(path)).toBeNull();
  });

  test('null / undefined path', () => {
    expect(detectShow(null)).toBeNull();
    expect(detectShow(undefined)).toBeNull();
  });
});

describe('Crc32Regex', () => {
  test('extracts an 8-hex crc32 token', () => {
    expect('[Group] Show - 01 [9A1B5C3D].mkv'.match(Crc32Regex)?.[1]).toBe('9A1B5C3D');
  });
  test('needs non-alphanumeric boundaries', () => {
    expect('ShowName9A1B5C3Dmkv'.match(Crc32Regex)).toBeNull();
  });
  test('ignores a short (6-hex) token', () => {
    expect('[Group] Show - 01 [ABCDEF].mkv'.match(Crc32Regex)).toBeNull();
  });
});

describe('no catastrophic backtracking', () => {
  // A pathological name that could blow up a greedy alternation. Should return
  // quickly regardless of match result.
  test('long adversarial filename returns fast', () => {
    const evil = `${'a '.repeat(400)}${'- '.repeat(200)}1080p.mkv`;
    const start = performance.now();
    detectShow(evil);
    expect(performance.now() - start).toBeLessThan(250);
  });
});
