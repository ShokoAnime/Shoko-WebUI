export type AniDbPromptType = {
  answer: string;
  prompt: string;
};

export const ANIDB_RULES_SNOOZE_KEY = 'anidb-add-files-rules-snooze-until';

export const anidbPrompts: AniDbPromptType[] = [
  {
    answer: 'private',
    prompt: 'Type the category name AniDB uses for disallowed files like remuxes and personal re-encodes.',
  },
  {
    answer: 'banned',
    prompt: 'Type the word that describes what can happen to your AniDB account if you ignore these rules.',
  },
  {
    answer: 'remuxes',
    prompt: 'Type the specific file type mentioned in the warning that AniDB does not allow users to add.',
  },
];
