export type TagType = {
  ID: number;
  Name: string;
  Description?: string;
  IsSpoiler: boolean;
  Weight: number;
  Size?: number;
  Source: 'AniDB' | 'User';
};
