import type { ImageLinkType, ImageSourceType, ImageTypeEnum, RatingType } from './common';

export type RandomImageMetadataResultType = {
  Source: string;
  Type: ImageTypeEnum;
  ID: string;
  UID: string;
  Available: boolean;
  Preferred: boolean;
  Width?: number;
  Height?: number;
  Disabled: boolean;
  Series: {
    ID: number;
    Name: string;
  };
};

export type ImageSlimType = ImageLinkType & {
  /** Primary image's UUID in the linked image list. */
  PrimaryUID: string;
  /** Extra image UUIDs in the linked image list, except the primary image. */
  LinkedUIDs?: string[];
  Source: string;
  ResourceID: string;
  ContentType: string;
  Disabled: boolean;
  LanguageCode?: string;
  CountryCode?: string;
  Width?: number;
  Height?: number;
};

export type CrossReferenceImageType = 'Primary' | 'Backdrop' | 'Banner' | 'Logo' | 'Disc';

export type ImageCrossReferenceType = {
  /** The cross-reference ID — used for set-preferred mutations. */
  ID: number;
  ImageID: string;
  /** The primary image's UUID for the associated entity. */
  PrimaryImageID: string;
  ImageType: CrossReferenceImageType;
  ImageSource: ImageSourceType;
  EntityID: string;
  EntityType: string;
  EntitySource: string;
  EntitySeasonNumber?: number;
  EntityEpisodeNumber?: number;
  EntityReleasedAt?: string;
  /** Ordering number — lower values appear first. */
  Ordering: number;
  IsEnabled: boolean;
  /** Whether auto-download of the image is desired. */
  IsDesired: boolean;
  IsPreferred: boolean;
  CommunityRating?: RatingType;
  /** The source of the cross-reference (e.g. "User" for manual). */
  Source: string;
  CreatedAt: string;
  LastUpdatedAt: string;
  /** Included when ?includeImage=true. */
  Image?: ImageSlimType;
};

export type ImageTabType = 'Posters' | 'Backdrops' | 'Logos';
