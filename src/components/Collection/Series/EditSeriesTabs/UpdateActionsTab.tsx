import Action from '@/components/Collection/Series/EditSeriesTabs/Action';
import {
  useAutoSearchAnilistMatchMutation,
  useAutoSearchTmdbMatchMutation,
  useRefreshSeriesAniDBInfoMutation,
  useRefreshSeriesAnilistInfoMutation,
  useRefreshSeriesTMDBInfoMutation,
  useUpdateSeriesAnilistImagesMutation,
  useUpdateSeriesTMDBImagesMutation,
} from '@/core/react-query/series/mutations';

type Props = {
  seriesId: number;
};

const UpdateActionsTab = ({ seriesId }: Props) => {
  const { mutate: refreshAnidb } = useRefreshSeriesAniDBInfoMutation(seriesId);
  const { mutate: autoMatchTmdb } = useAutoSearchTmdbMatchMutation(seriesId);
  const { mutate: refreshTmdb } = useRefreshSeriesTMDBInfoMutation(seriesId);
  const { mutate: updateTmdbImagesMutation } = useUpdateSeriesTMDBImagesMutation(seriesId);
  const { mutate: autoMatchAnilist } = useAutoSearchAnilistMatchMutation(seriesId);
  const { mutate: refreshAnilist } = useRefreshSeriesAnilistInfoMutation(seriesId);
  const { mutate: updateAnilistImagesMutation } = useUpdateSeriesAnilistImagesMutation(seriesId);

  const triggerAnidbRefresh = (force: boolean, cacheOnly: boolean) => {
    refreshAnidb({ force, cacheOnly });
  };

  const updateTmdbImagesForce = () => {
    updateTmdbImagesMutation({ force: true });
  };

  const updateAnilistImagesForce = () => {
    updateAnilistImagesMutation({ force: true });
  };

  return (
    <div className="flex h-88 grow flex-col gap-y-4 overflow-y-auto">
      <Action
        name="Update AniDB Info"
        description="Gets the latest series information from the AniDB database."
        onClick={() => triggerAnidbRefresh(false, false)}
      />
      <Action
        name="Update AniDB Info - Force"
        description="Forces a complete update from AniDB, bypassing usual checks."
        onClick={() => triggerAnidbRefresh(true, false)}
      />
      <Action
        name="Update AniDB Info - XML Cache"
        description="Updates AniDB data using information from local XML cache."
        onClick={() => triggerAnidbRefresh(false, true)}
      />
      <Action
        name="Auto-Search TMDB Match"
        description="Automatically searches for a TMDB match."
        onClick={autoMatchTmdb}
      />
      <Action
        name="Update TMDB Info"
        description="Gets the latest series information from TMDB."
        onClick={refreshTmdb}
      />
      <Action
        name="Update TMDB Images - Force"
        description="Forces a complete redownload of images from TMDB."
        onClick={updateTmdbImagesForce}
      />
      <Action
        name="Auto-Search AniList Match"
        description="Automatically searches for an AniList match."
        onClick={autoMatchAnilist}
      />
      <Action
        name="Update AniList Info"
        description="Gets the latest series information from AniList."
        onClick={refreshAnilist}
      />
      <Action
        name="Update AniList Images - Force"
        description="Forces a complete redownload of images from AniList."
        onClick={updateAnilistImagesForce}
      />
    </div>
  );
};

export default UpdateActionsTab;
