type ColectionSizes = {
  Episodes: number;
  Specials: number;
  Credits: number;
  Trailers: number;
  Parodies: number;
  Other: number;
};
type CollectionImage = {
  Source: 'AniDB' | 'TvDB' | 'TMDB' | 'Shoko';
  Type: 'Poster' | 'Banner' | 'Thumb' | 'Fanart' | 'Character' | 'Staff' | 'Static';
  ID: string;
  RelativeFilepath?:string;
  Preferred: boolean;
  Width?: number;
  Height?: number;
  Disabled: boolean;
};

export type CollectionGroup = {
  IDs: {
    DefaultSeries?: number,
    ParentGroup?: number,
    TopLevelGroup: number,
    ID: number,
  }
  SortName?:string;
  Description?:	string;
  HasCustomName:	boolean;
  Images: {
    Posters: Array<CollectionImage>;
    Fanarts: Array<CollectionImage>;
    Banners: Array<CollectionImage>;
  }
  Name:	string;
  Size: number;
  Sizes: {
    Local: Array<ColectionSizes>;
    Watched: Array<ColectionSizes>;
    Total: Array<ColectionSizes>;
  }
};