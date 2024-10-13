import { useMemo } from 'react';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useRouteLink = (isSeries: boolean, item: CollectionGroupType | SeriesType) => {
  const routeLink = useMemo(() => {
    let link = '/webui/collection/';

    if (isSeries) {
      link += `series/${item.IDs.ID}`;
    } else if (item.Size === 1) {
      link += `series/${(item as CollectionGroupType).IDs.MainSeries}`;
    } else {
      link += `group/${item.IDs.ID}`;
    }

    return link;
  }, [isSeries, item]);

  return routeLink;
};

export default useRouteLink;
