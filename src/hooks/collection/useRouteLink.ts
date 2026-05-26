import { useMemo } from 'react';
import { useParams } from 'react-router';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useRouteLink = (item: CollectionGroupType | SeriesType) => {
  const { filterId, groupId } = useParams();

  return useMemo(() => {
    let link = '/webui/collection';

    if (groupId) {
      // groupId present → item is SeriesType
      return `${link}/series/${item.IDs.ID}`;
    }

    // No groupId → item is CollectionGroupType
    const group = item as CollectionGroupType;

    // TODO: Remove `?? group.Size` fallback once minimum server version is bumped
    if ((group.TotalSize ?? group.Size) === 1) {
      return `${link}/series/${group.IDs.MainSeries}`;
    }

    link += `/group/${group.IDs.ID}`;

    if (filterId) {
      return `${link}/filter/${filterId}`;
    }

    return link;
  }, [filterId, groupId, item]);
};

export default useRouteLink;
