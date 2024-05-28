export type TagType = {
  ID: number;
  Name: string;
  Description?: string;
  IsSpoiler: boolean;
  Weight: number;
  Source: 'AniDB' | 'User';
};
