import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import type { CollectionGroupType } from '@/core/types/api/collection';
import type { SeriesType } from '@/core/types/api/series';

const useRouteLink = (isSeries: boolean, item: CollectionGroupType | SeriesType) => {
  const { pathname } = useLocation();

  return useMemo(() => {
    let link = '/webui/collection';

    if (isSeries) {
      return `${link}/series/${item.IDs.ID}`;
    }

    if (item.Size === 1) {
      return `${link}/series/${(item as CollectionGroupType).IDs.MainSeries}`;
    }

    link += `/group/${item.IDs.ID}`;

    if (pathname.endsWith('/live')) {
      return `${link}/live`;
    }

    return link;
  }, [isSeries, item, pathname]);
};

export default useRouteLink;
