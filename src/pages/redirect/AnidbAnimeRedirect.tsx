import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { Slide, ToastContainer } from 'react-toastify';
import { mdiAlertCircleOutline, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import { useRandomImageMetadataQuery } from '@/core/react-query/image/queries';
import { useSeriesByAnidbIdQuery } from '@/core/react-query/series/queries';
import { ImageTypeEnum } from '@/core/types/api/common';
import useNavigateVoid from '@/hooks/useNavigateVoid';

const AnidbAnimeRedirect = () => {
  const navigate = useNavigateVoid();
  const { animeId } = useParams();
  const query = useSeriesByAnidbIdQuery(Number(animeId), !Number.isNaN(Number(animeId)));
  const imageMetadataQuery = useRandomImageMetadataQuery(ImageTypeEnum.Backdrop);

  const [{ imageUrl }, setImage] = useState(() => ({
    imageUrl: '',
  }));

  useEffect(() => {
    if (imageMetadataQuery.isPending) return;
    if (!imageMetadataQuery.isSuccess || !imageMetadataQuery.data.Type) {
      setImage({ imageUrl: 'default' });
      return;
    }
    const { ID, Source, Type } = imageMetadataQuery.data;
    setImage({
      imageUrl: `/api/v3/Image/${Source}/${Type}/${ID}`,
    });
  }, [imageMetadataQuery.isSuccess, imageMetadataQuery.isPending, imageMetadataQuery.data]);

  useEffect(() => {
    if (query.isSuccess && query.data) {
      navigate(`/webui/collection/series/${query.data.IDs.ID}`, { replace: true });
    }
  }, [query.isSuccess, query.data, navigate]);

  return (
    <>
      <title>{`AniDB Anime ${animeId} | Redirect | Shoko`}</title>
      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        transition={Slide}
        className="mt-20 !w-[29.5rem]"
        closeButton={false}
        icon={false}
      />
      <div className="relative flex h-screen w-screen flex-col items-center justify-center gap-y-2">
        <div className="flex flex-col items-center rounded-lg border border-panel-border bg-panel-background-transparent drop-shadow-md">
          {/* Loading indicator */}
          {(query.isLoading || query.isFetching) && (
            <div className="flex items-center justify-center gap-x-2 p-4">
              <Icon path={mdiLoading} spin size={1.5} />
            </div>
          )}
          {(query.isError || !query.data) && (
            <div className="flex items-center justify-center gap-x-2 p-4">
              <Icon path={mdiAlertCircleOutline} size={1.5} />
              <span>Something went wrong! Unable to find the requested series in the local collection.</span>
            </div>
          )}
        </div>
        <div
          className={cx(
            'fixed left-0 top-0 -z-10 h-full w-full opacity-20',
            imageUrl === 'default' && 'login-image-default',
          )}
          style={imageUrl !== '' && imageUrl !== 'default'
            ? { background: `center / cover no-repeat url('${imageUrl}')` }
            : {}}
        />
      </div>
    </>
  );
};

export default AnidbAnimeRedirect;
