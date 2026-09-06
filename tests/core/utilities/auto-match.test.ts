import { describe, expect, it } from 'vitest';

import { detectShow, findMostCommonShowName } from '@/core/utilities/auto-match-logic';
import PathMatchRuleSet, { Crc32Regex } from '@/core/utilities/auto-match-regexes';

import type { PathDetails } from '@/core/utilities/auto-match-logic';

// Regression suite for the auto-match filename parser.
// Every expected value below was derived from the CURRENT implementation
// (src/core/utilities/auto-match-logic.ts + auto-match-regexes.ts), which is
// the ground truth — including quirks, which are explicitly commented.
//
// Note: DriveLetterRegex and defaultTransform are module-private; their
// behavior is exercised exclusively through the public detectShow output.

const expectParsed = (filePath: string, expected: Partial<PathDetails>) => {
  const result = detectShow(filePath);
  expect(result).not.toBe(null);
  expect(result).toMatchObject(expected);
};

const showDetails = (showName: string | null): PathDetails => ({
  crc32: null,
  episodeEnd: 1,
  episodeName: null,
  episodeStart: 1,
  episodeType: 'Episode',
  fileExtension: null,
  filePath: 'x.mkv',
  releaseGroup: null,
  ruleName: 'test',
  season: null,
  showName,
  source: null,
  version: null,
});

describe('Crc32Regex', () => {
  // /[^0-9A-Z]([0-9A-F]{8})[^0-9A-Z]/i requires non-alphanumeric
  // delimiters on BOTH sides and exactly 8 hex digits in the capture group.
  it('captures exactly 8 hex digits between non-alphanumeric boundaries', () => {
    expect(Crc32Regex.exec('[ABCDEF01]')?.[1]).toBe('ABCDEF01');
    expect(Crc32Regex.exec(' 1234ABCD ')?.[1]).toBe('1234ABCD');
  });

  it('does not capture runs of any length other than 8 digits', () => {
    expect(Crc32Regex.exec('[ABCDEF1]')).toBe(null);
    expect(Crc32Regex.exec('[ABCDEF012]')).toBe(null);
  });

  it('is case-insensitive for hex digits', () => {
    expect(Crc32Regex.exec('[abcdef01]')?.[1]).toBe('abcdef01');
  });

  it('rejects non-hex alphanumeric characters', () => {
    expect(Crc32Regex.exec('[ABCDEFGH]')).toBe(null);
  });

  it('requires a non-alphanumeric character before AND after the value', () => {
    expect(Crc32Regex.exec('ABCDEF01')).toBe(null);
    expect(Crc32Regex.exec('xABCDEF01]')).toBe(null);
  });

  it('detectShow surfaces the checksum in the crc32 output field', () => {
    expectParsed('[SubsPlease] Bocchi the Rock! - 04 (1080p) [AB12CD34].mkv', {
      crc32: 'AB12CD34',
      ruleName: 'default',
    });
    expectParsed('Barakamon - 01 (1080p) [78f0f76d].mkv', {
      crc32: '78f0f76d', // lowercase preserved verbatim
      ruleName: 'default',
    });
  });
});

describe('detectShow', () => {
  it('returns null for missing or blank input', () => {
    expect(detectShow(undefined)).toBe(null);
    expect(detectShow(null)).toBe(null);
    expect(detectShow('')).toBe(null);
    expect(detectShow('   ')).toBe(null);
  });

  describe('anti-timestamp', () => {
    // Rule 1 in source order. Its transform returns `null`, which BREAKS the
    // rule loop: timestamped files never fall through to later rules.
    it('invalidates timestamp-named files via null transform', () => {
      expect(detectShow('2023-06-18 12.34.56.mp4')).toBe(null);
    });

    it('invalidates timestamp files with fractional seconds and timezone', () => {
      expect(detectShow('2023_06_18 12-34-56-123456Z.mp4')).toBe(null);
    });
  });

  describe('raws-1', () => {
    it('parses space-delimited "Title NN <res> -Group (Source)" names', () => {
      expectParsed('Bocchi the Rock 04 1080p -SubsGroup (CR).mkv', {
        episodeEnd: 4,
        episodeStart: 4,
        episodeType: 'Episode',
        fileExtension: 'mkv',
        releaseGroup: 'SubsGroup',
        ruleName: 'raws-1',
        season: null,
        showName: 'Bocchi the Rock',
        // DISCREPANCY: the regex captures a `source` group ('CR' here), but
        // detectShow never maps it onto PathDetails.source — always null.
        source: null,
      });
    });

    it('captures season from S01E04 form (quirk: a following " v2" is eaten by the wildcard token, so version stays null)', () => {
      expectParsed('Bocchi the Rock S01E04 v2 1080p -SubsGroup (CR).mkv', {
        episodeStart: 4,
        releaseGroup: 'SubsGroup',
        ruleName: 'raws-1',
        season: 1,
        version: null,
      });
    });

    it('folds season into the show name when season > 1 (defaultTransform " S2" append)', () => {
      expectParsed('Bocchi the Rock S02E04 1080p -SubsGroup (CR).mkv', {
        ruleName: 'raws-1',
        season: 2,
        showName: 'Bocchi the Rock S2',
      });
    });
  });

  describe('raws-2', () => {
    it('parses dot-delimited scene/WEB-DL naming', () => {
      expectParsed('Frieren.Beyond.Journeys.End.S01E01.1080p.WEB-DL.DD5.1.H.264-Group.mkv', {
        episodeEnd: 1,
        episodeStart: 1,
        episodeType: 'Episode',
        releaseGroup: 'Group',
        ruleName: 'raws-2',
        season: 1,
        showName: 'Frieren Beyond Journeys End', // dots normalized to spaces
      });
    });

    it('parses the "Ep.NN" separator variant', () => {
      expectParsed('Steins.Gate.Ep.07.1080p.WEB-DL.AAC2.0.H.264-AVS.mkv', {
        episodeStart: 7,
        releaseGroup: 'AVS',
        ruleName: 'raws-2',
        showName: 'Steins Gate',
      });
    });

    it('quirk: a bare year token is parsed as the episode number when no S/E token exists', () => {
      expectParsed('Some.Show.2019.1080p.WEB-DL-AVS.mkv', {
        episodeStart: 2019,
        ruleName: 'raws-2',
        showName: 'Some Show',
      });
    });
  });

  describe('raws-3', () => {
    it('parses "Title -S02E04- Group" style names (episode block must not be followed by a spaced bracket)', () => {
      expectParsed('KonoSuba S02E04 -Group.mkv', {
        episodeStart: 4,
        releaseGroup: 'Group',
        ruleName: 'raws-3',
        season: 2,
        showName: 'KonoSuba S2',
      });
    });

    it('quirk: with "Title 04 [1080p]-Group.mkv" the episode block cannot fire, so "04" stays in the show name and the episode falls back to 1', () => {
      expectParsed('KonoSuba 04 [1080p]-Group.mkv', {
        episodeStart: 1,
        releaseGroup: 'Group',
        ruleName: 'raws-3',
        showName: 'KonoSuba 04',
      });
    });
  });

  describe('trash-anime', () => {
    it('parses "Title (YYYY) - S01E01 - NN - Episode Name [extra].ext" names, including episodeName and parenthetical year retention', () => {
      expectParsed('That Time I Got Reincarnated as a Slime (2018) - S01E01 - 1 - A New Beginning [HorribleSubs].mkv', {
        episodeEnd: 1,
        episodeName: 'A New Beginning', // trailing space from the raw capture is trimmed
        episodeStart: 1,
        episodeType: 'Episode',
        // The release-group capture requires a "-Group" run directly before the
        // extension; a plain trailing "[HorribleSubs]" is not captured.
        releaseGroup: null,
        ruleName: 'trash-anime',
        season: 1,
        showName: 'That Time I Got Reincarnated as a Slime (2018)',
      });
    });

    it('takes the episode number from the SxxExx marker, not the trailing absolute number', () => {
      expectParsed('Generic Show Title (2020) - S02E08 - 021 - The Episode Title [Group].mkv', {
        episodeEnd: 8,
        episodeStart: 8,
        ruleName: 'trash-anime',
        season: 2,
      });
    });

    it('flags S00 specials via the isSpecial group -> episodeType Special', () => {
      expectParsed('That Time I Got Reincarnated as a Slime (2018) - S00E01 - 1 - A New Beginning [HorribleSubs].mkv', {
        episodeStart: 1,
        episodeType: 'Special',
        ruleName: 'trash-anime',
      });
    });
  });

  describe('trailing-native-title', () => {
    it('parses "Group + Title (YYYY) S01E01 <res> <native title>" names that no earlier rule terminates', () => {
      expectParsed('[CR] A Condition Called Show (2022) S01E01 1080p Sono Toki Kanojo Wa.mkv', {
        episodeEnd: 1,
        episodeStart: 1,
        episodeType: 'Episode',
        releaseGroup: 'CR',
        ruleName: 'trailing-native-title',
        season: 1,
        showName: 'A Condition Called Show (2022)',
      });
    });

    it('works without the leading release-group bracket', () => {
      expectParsed('A Condition Called Show (2022) S01E01 1080p Sono Toki Kanojo Wa.mkv', {
        releaseGroup: null,
        ruleName: 'trailing-native-title',
        showName: 'A Condition Called Show (2022)',
      });
    });
  });

  describe('default', () => {
    it('parses bracketed group + "Title - NN (res) [hash]" naming', () => {
      expectParsed('[SubsPlease] Bocchi the Rock! - 04 (1080p) [AB12CD34].mkv', {
        crc32: 'AB12CD34',
        episodeEnd: 4,
        episodeStart: 4,
        fileExtension: 'mkv',
        releaseGroup: 'SubsPlease',
        ruleName: 'default',
        season: null,
        showName: 'Bocchi the Rock!',
      });
    });

    it('captures the episode title as episodeName in "Title - 01 - Ep Title" form', () => {
      expectParsed('Show Name - 01 - The First Day [1080p].mkv', {
        episodeName: 'The First Day',
        episodeStart: 1,
        ruleName: 'default',
        showName: 'Show Name',
      });
    });

    it('captures multi-episode ranges as episodeStart/episodeEnd', () => {
      expectParsed('Show Name - E01-03 [1080p].mkv', {
        episodeEnd: 3,
        episodeStart: 1,
        ruleName: 'default',
        showName: 'Show Name',
      });
    });

    it('quirk: "E01E02" is NOT parsed as a range; "E01E" is absorbed into the show name and episode becomes 2', () => {
      expectParsed('Show Name - E01E02 [1080p].mkv', {
        episodeStart: 2,
        ruleName: 'default',
        showName: 'Show Name - E01E',
      });
    });

    it('captures release version from "- 01v2"', () => {
      expectParsed('Sword Art Online - 01v2 [1080p].mkv', {
        episodeStart: 1,
        ruleName: 'default',
        showName: 'Sword Art Online',
        version: 2,
      });
    });

    it('keeps a parenthetical year in the show name', () => {
      expectParsed('Re Zero (2016) - 01 [1080p].mkv', {
        ruleName: 'default',
        showName: 'Re Zero (2016)',
      });
    });

    it('isMovie: "Movie" stays in the show name and a 0-episode is corrected to 1', () => {
      expectParsed('Show Name Movie - 00 [1080p].mkv', {
        episodeEnd: 1,
        episodeStart: 1,
        ruleName: 'default',
        showName: 'Show Name Movie',
      });
    });

    it('isMovie2: "Gekijouban" theatrical naming keeps the full prefix in the show name', () => {
      expectParsed('Gekijouban Kaguya wa Nekketsu Shoujo S01E01 [1080p].mkv', {
        episodeStart: 1,
        ruleName: 'default',
        season: 1,
        showName: 'Gekijouban Kaguya wa Nekketsu Shoujo',
      });
    });

    it('folds a bare trailing year into parentheses via defaultTransform', () => {
      expectParsed('Some Show 2019 - 01 [1080p].mkv', {
        ruleName: 'default',
        showName: 'Some Show (2019)',
      });
    });

    it('a trailing "[Group]" bracket is NOT treated as release group by this rule', () => {
      expectParsed('Violet Evergarden - 01 [1080p] [SubGroup].mkv', {
        releaseGroup: null,
        ruleName: 'default',
        showName: 'Violet Evergarden',
      });
    });

    it('nuls a show name that is exactly "Episode" (line-115 guard)', () => {
      expectParsed('Episode 100 [1080p].mkv', {
        episodeStart: 100,
        ruleName: 'default',
        showName: null,
      });
    });

    it('does not capture OVA markers into a special episode type (isOVA group is parsed but unused)', () => {
      expectParsed('[Group] Show Name OVA 01 [1080p].mkv', {
        episodeStart: 1,
        episodeType: 'Episode',
        releaseGroup: 'Group',
        ruleName: 'default',
        showName: 'Show Name OVA',
      });
    });
  });

  describe('foreign-1', () => {
    it('parses "Title - NN 「native」 (year)" names (default rejects them: 「」 are not recognized junk tokens)', () => {
      expectParsed('Golden Kamuy - 01 「ゴールデンカムイ」 (2018).mkv', {
        episodeEnd: 1,
        episodeStart: 1,
        fileExtension: 'mkv',
        releaseGroup: null,
        ruleName: 'foreign-1',
        season: null,
        showName: 'Golden Kamuy',
      });
    });
  });

  describe('brackets-1', () => {
    it('parses spaceless "[Group][Title][YYYY][NN][res].ext" chains (the rule requires no spaces between bracket tokens)', () => {
      expectParsed('[HorribleSubs][Shingeki no Kyojin][2013][01][1080p].mkv', {
        episodeEnd: 1,
        episodeStart: 1,
        fileExtension: 'mkv',
        releaseGroup: 'HorribleSubs',
        ruleName: 'brackets-1',
        showName: 'Shingeki no Kyojin',
      });
    });
  });

  describe('brackets-2', () => {
    it('parses spaceless "[Group][Title][NN][res].ext" chains (no year bracket)', () => {
      expectParsed('[Judas][Kaguya-sama][12][720p].mkv', {
        episodeEnd: 12,
        episodeStart: 12,
        releaseGroup: 'Judas',
        ruleName: 'brackets-2',
        showName: 'Kaguya-sama',
      });
    });

    it('also handles resolution brackets containing "x" dimensions', () => {
      expectParsed('[FFF][Baka to Test][01][1280x720].mkv', {
        episodeStart: 1,
        releaseGroup: 'FFF',
        ruleName: 'brackets-2',
        showName: 'Baka to Test',
      });
    });
  });

  describe('brackets-3', () => {
    // DEAD RULE in practice: its "[Group]...[Title] - NN [junk].ext" shape is
    // always matched earlier by `default` (rule 7), which swallows the whole
    // name and empties the show title during trimming.
    it('is shadowed by `default`: a realistic brackets-3 filename is reported with ruleName "default"', () => {
      const fixture = '[SubPlease][KonoSuba] - 04 [720p][ABCD].mkv';
      const brackets3 = PathMatchRuleSet.find(rule => rule.name === 'brackets-3');
      expect(brackets3?.regex.test(fixture)).toBe(true); // brackets-3 COULD match...
      const result = detectShow(fixture);
      expect(result?.ruleName).toBe('default'); // ...but default fires first (earlier in the list)
      expect(result?.showName).toBe(''); // quirk: default strips the bracket chain to an empty name
      expect(result?.episodeStart).toBe(4);
    });
  });

  describe('reversed-1', () => {
    it('parses "NN - Title [res].ext" names', () => {
      expectParsed('01 - Generic Show Title [1080p].mkv', {
        episodeStart: 1,
        ruleName: 'reversed-1',
        showName: 'Generic Show Title',
      });
    });
  });

  describe('fallback', () => {
    // Not dead: the fallback regex differs from `default` by making the
    // episode-number block OPTIONAL (one extra `?`), so it catches episodeless
    // names that default rejects.
    it('parses episodeless creditless-ed naming with ruleName "fallback"', () => {
      expectParsed('Show Name NC ED [1080p].mkv', {
        episodeEnd: 1,
        episodeStart: 1,
        episodeType: 'Credits',
        ruleName: 'fallback',
        showName: 'Show Name NC',
      });
    });

    it('preserves "(Part II)" in the show name for episodeless movie names', () => {
      expectParsed('Movie Name (Part II) [1080p].mkv', {
        episodeEnd: 1, // no episode captured -> destructure default of 1
        episodeStart: 1,
        ruleName: 'fallback',
        showName: 'Movie Name (Part II)',
      });
    });
  });

  describe('drive-letter handling (module-private DriveLetterRegex, exercised via detectShow)', () => {
    it('nulls a "C:" component at any path depth or form (grandparent, parent, unix-mounted) without polluting show/release names', () => {
      expectParsed('C:\\Show\\One Piece - 100 [1080p].mkv', {
        releaseGroup: null, // 'Show' directory component never leaks
        ruleName: 'default',
        showName: 'One Piece', // no 'C:' contamination
        episodeStart: 100,
      });
      expectParsed('C:\\One Piece - 100 [1080p].mkv', {
        ruleName: 'default',
        showName: 'One Piece',
      });
      expectParsed('/mnt/C:/One Piece - 100 [1080p].mkv', {
        ruleName: 'default',
        showName: 'One Piece',
      });
    });

    it('a bare drive letter as the only component yields null', () => {
      expect(detectShow('X:')).toBe(null);
    });

    it('behavior note: "/mnt/C/..." (no colon) is NOT a drive component, and DriveLetterRegex is case-sensitive ("c:" not nulled) — output is identical either way because no rule consumes directory components', () => {
      const unix = detectShow('/mnt/C/Show/One Piece - 100 [1080p].mkv');
      expect(unix?.ruleName).toBe('default');
      expect(unix?.showName).toBe('One Piece');
      const lower = detectShow('c:\\Show\\One Piece - 100 [1080p].mkv');
      expect(lower?.showName).toBe('One Piece');
      expect(lower?.releaseGroup).toBe(null);
    });
  });
});

describe('detectShow — defaultTransform effects (module-private, asserted through parsed output)', () => {
  // The shared transform is attached to every rule except anti-timestamp.

  it('swaps reversed episode ranges (E12-01 -> 1..12)', () => {
    expectParsed('Show Name - E12-01 [1080p].mkv', {
      episodeEnd: 12,
      episodeStart: 1,
      ruleName: 'default',
    });
  });

  it('parses ranges with a season prefix (S02E05-08 -> 5..8)', () => {
    expectParsed('Some_Show_S02E05-08 [1080p].mkv', {
      episodeEnd: 8,
      episodeStart: 5,
      season: 2,
      showName: 'Some Show S2',
    });
  });

  it('maps a non-integer episode ("05.5") to Special with episode 0', () => {
    expectParsed('Show Name - 05.5 [1080p].mkv', {
      episodeEnd: 0,
      episodeStart: 0,
      episodeType: 'Special',
      ruleName: 'default',
      showName: 'Show Name',
    });
  });

  it('detectEpisodeType precedence: theme song -> Credits, and the theme marker supplies the episode number', () => {
    expectParsed('Show Name NC ED 2 [1080p].mkv', {
      episodeEnd: 2,
      episodeStart: 2,
      episodeType: 'Credits',
      ruleName: 'default',
      showName: 'Show Name NC',
    });
  });

  it('theme song matched by a rule without an isThemeSong group (raws-2) still gets episodeType Credits', () => {
    expectParsed('Show.Name.S01E01.NCED.1080p.WEB.h264-Group.mkv', {
      episodeType: 'Credits',
      ruleName: 'raws-2',
    });
  });

  it('detectEpisodeType precedence: trailer marker -> Trailer', () => {
    expectParsed('Show Name PV [1080p].mkv', {
      episodeType: 'Trailer',
      ruleName: 'fallback',
      showName: 'Show Name',
    });
  });

  it('detectEpisodeType: an isSpecial marker outranks plain numbering (S00 special)', () => {
    expectParsed('That Time I Got Reincarnated as a Slime (2018) - S00E01 - 1 - A New Beginning [HorribleSubs].mkv', {
      episodeType: 'Special',
      ruleName: 'trash-anime',
    });
  });

  it('extra-content check ("BD Menu" on a 0-episode) -> Special', () => {
    expectParsed('Show Name - 00 (BD Menu).mkv', {
      episodeEnd: 0,
      episodeStart: 0,
      episodeType: 'Special',
      ruleName: 'default',
      showName: 'Show Name',
    });
  });

  it('DISCREPANCY: the isOther -> "Other" branch in detectEpisodeType is unreachable (no rule defines an isOther group)', () => {
    const definesGroup = (groupName: string) => PathMatchRuleSet.some(rule => rule.regex.source.includes(groupName));
    expect(definesGroup('isOther')).toBe(false);
    // The same is true for isTv and a crc32 capture group: defaultTransform
    // reads match.groups.isTv, and detectShow reads match.groups.crc32, but no
    // rule ever defines them (crc32 is instead extracted from match[0]).
    expect(definesGroup('isTv')).toBe(false);
    expect(definesGroup('(?<crc32')).toBe(false);
  });

  it('folds a trailing " S02" into the season and appends " S2" to the show name (season > 1, no year)', () => {
    // 'Some_Show_S02E05' -> showName 'Some Show S2' also demonstrates
    // underscore -> space normalization and the season-fold path together.
    expectParsed('Some_Show_S02E05 [1080p].mkv', {
      episodeStart: 5,
      ruleName: 'default',
      season: 2,
      showName: 'Some Show S2',
    });
  });

  it('does not append the season marker for season 1 (year-less name stays clean)', () => {
    expectParsed('Frieren.Beyond.Journeys.End.S01E01.1080p.WEB-DL.DD5.1.H.264-Group.mkv', {
      ruleName: 'raws-2',
      season: 1,
      showName: 'Frieren Beyond Journeys End',
    });
  });

  it('converts a trailing roman numeral into the season', () => {
    expectParsed('Naruto Shippuden III - 05 [1080p].mkv', {
      episodeStart: 5,
      ruleName: 'default',
      season: 3,
      showName: 'Naruto Shippuden S3', // appended because season 3 != 1 and no year
    });
  });

  it('normalizes dots to spaces in dot-delimited names (raws-2 fixture above) and keeps mixed-space names untouched', () => {
    expectParsed('Bocchi the Rock 04 1080p -SubsGroup (CR).mkv', {
      ruleName: 'raws-1',
      showName: 'Bocchi the Rock', // already has spaces -> no [_.] -> ' ' rewrite
    });
  });

  it('TrimShowNameRegex: junk tokens adjacent to the episode marker are stripped from the show name', () => {
    expectParsed('Show Name [Dual Audio] [1080p] - 03.mkv', {
      episodeStart: 3,
      ruleName: 'default',
      showName: 'Show Name',
    });
  });

  it('TrimShowNameRegex negative lookaheads keep "(Part II)" and parenthetical years from being trimmed', () => {
    expectParsed('Movie Name (Part II) [1080p].mkv', {
      ruleName: 'fallback',
      showName: 'Movie Name (Part II)',
    });
    expectParsed('Re Zero (2016) - 01 [1080p].mkv', {
      ruleName: 'default',
      showName: 'Re Zero (2016)',
    });
  });

  it('ReStitchRegex: an episodeless "Title - Subtitle" name is re-stitched and episodeName nulled', () => {
    expectParsed('Ghost in the Shell - Stand Alone Complex [1080p].mkv', {
      episodeName: null,
      ruleName: 'fallback',
      showName: 'Ghost in the Shell - Stand Alone Complex',
    });
  });

  it('TV-suffix fixup: a trailing " TV" becomes "(TV)" (via the endsWith branch; no rule ever sets the isTv group)', () => {
    expectParsed('Some Show TV - 01 [1080p].mkv', {
      ruleName: 'default',
      showName: 'Some Show (TV)',
    });
  });

  it('movie numbering correction: isMovie + episode 0 becomes episode 1 (covered above, pinned here explicitly)', () => {
    const result = detectShow('Show Name Movie - 00 [1080p].mkv');
    expect(result?.episodeStart).toBe(1);
    expect(result?.episodeEnd).toBe(1);
  });
});

describe('findMostCommonShowName', () => {
  it('returns the most frequent show name', () => {
    const showList = [
      showDetails('Naruto'),
      showDetails('Naruto'),
      showDetails('Bleach'),
    ];
    expect(findMostCommonShowName(showList)).toBe('Naruto');
  });

  it('on equal counts, the later-listed name wins (strict > comparison)', () => {
    const showList = [
      showDetails('Bleach'),
      showDetails('Bleach'),
      showDetails('Naruto'),
      showDetails('Naruto'),
    ];
    expect(findMostCommonShowName(showList)).toBe('Naruto');
  });

  it('when every name appears once, returns the longest common prefix (findSharedShowName behavior)', () => {
    const showList = [
      showDetails('Naruto Shippuden'),
      showDetails('Naruto'),
    ];
    expect(findMostCommonShowName(showList)).toBe('Naruto');
  });

  it('when every name appears once but they share no prefix, falls back to the first found name', () => {
    const showList = [
      showDetails('One Piece'),
      showDetails('Naruto'),
    ];
    expect(findMostCommonShowName(showList)).toBe('One Piece');
  });

  it('prefix scan only compares the sorted first/last names, so a middle outlier yields the first-name fallback', () => {
    // findSharedShowName only inspects the sorted extremes: 'Boruto' vs
    // 'Naruto Shippuden' share no prefix -> '' -> first inserted name wins.
    const showList = [
      showDetails('Naruto Shippuden'),
      showDetails('Naruto Runners'),
      showDetails('Boruto'),
    ];
    expect(findMostCommonShowName(showList)).toBe('Naruto Shippuden');
  });

  it('returns "" for an empty list without throwing', () => {
    expect(findMostCommonShowName([])).toBe('');
  });

  it('ignores null entries and nullish show names; returns "" when none remain', () => {
    const showList: (PathDetails | null)[] = [
      null,
      showDetails(null),
      showDetails(''), // falsy showName is skipped by the reducer
    ];
    expect(findMostCommonShowName(showList)).toBe('');
  });

  it('mixes null entries with valid ones without throwing', () => {
    const showList: (PathDetails | null)[] = [
      null,
      showDetails('Bocchi the Rock'),
      showDetails('Bocchi the Rock'),
      showDetails('KonoSuba'),
    ];
    expect(findMostCommonShowName(showList)).toBe('Bocchi the Rock');
  });
});

describe('PathMatchRuleSet integrity', () => {
  it('exposes the expected rules in source order (coverage cross-check: every name below has at least one fixture above)', () => {
    expect(PathMatchRuleSet.map(rule => rule.name)).toEqual([
      'anti-timestamp',
      'raws-1',
      'raws-2',
      'raws-3',
      'trash-anime',
      'trailing-native-title',
      'default',
      'foreign-1',
      'brackets-1',
      'brackets-2',
      'brackets-3',
      'reversed-1',
      'fallback',
    ]);
  });

  it('DISCREPANCY: no rule defines parentRegex/grandParentRegex, so detectShow\'s directory-inheritance branches are dead code', () => {
    expect(PathMatchRuleSet.every(rule => !rule.parentRegex && !rule.grandParentRegex)).toBe(true);
  });

  it('DISCREPANCY: rules capture a `source` group (e.g. "(CR)") but detectShow never maps it to PathDetails.source', () => {
    const raws1 = PathMatchRuleSet.find(rule => rule.name === 'raws-1');
    expect(raws1?.regex.source).toContain('(?<source>');
    const result = detectShow('Bocchi the Rock 04 1080p -SubsGroup (CR).mkv');
    expect(result?.source).toBe(null);
  });
});
