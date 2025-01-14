import { useMemo } from 'react';
import { useParams } from 'react-router';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useRouteLink = (item: CollectionGroupType | SeriesType) => {
  const { filterId } = useParams();

  return useMemo(() => {
    let link = '/webui/collection';

    if (!('MainSeries' in item.IDs)) {
      return `${link}/series/${item.IDs.AniDB}`;
    }

    if (item.Size === 1) {
      return `${link}/series/${(item as CollectionGroupType).IDs.MainAnime}`;
    }

    link += `/group/${item.IDs.ID}`;

    if (filterId) {
      return `${link}/filter/${filterId}`;
    }

    return link;
  }, [filterId, item]);
};

export default useRouteLink;
