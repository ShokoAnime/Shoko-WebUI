import { useMemo } from 'react';
import { useParams } from 'react-router';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useRouteLink = (item: CollectionGroupType | SeriesType) => {
  const { filterId, groupId } = useParams();

  return useMemo(() => {
    let link = '/collection';

    if (groupId) {
      return `${link}/series/${item.IDs.ID}`;
    }

    if (item.Size === 1) {
      return `${link}/series/${(item as CollectionGroupType).IDs.MainSeries}`;
    }

    link += `/group/${item.IDs.ID}`;

    if (filterId) {
      return `${link}/filter/${filterId}`;
    }

    return link;
  }, [filterId, groupId, item]);
};

export default useRouteLink;
