import React, { useEffect } from 'react';
import Events from '../../core/events';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../core/store';
import { CollectionGroup } from '../../core/types/api/collection';

function CollectionPage() {
  const items: Array<CollectionGroup> = useSelector((state: RootState) => state.collection.groups);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch({ type: Events.COLLECTION_PAGE_LOAD });
  }, []);
  
  const renderDetails = (item: CollectionGroup) => {
    const posters = item.Images.Posters.filter(p => p.Source === 'AniDB');
    
    return (
      <div key={`group-${item.IDs.ID}`} className="mr-4 last:mr-0 shrink-0 w-56 font-open-sans content-center flex flex-col">
        <div style={{ background: `center / cover no-repeat url('/api/v3/Image/AniDB/Poster/${posters[0].ID}')` }} className="h-72 rounded drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] border border-black my-2" />
        <p className="text-center text-base font-semibold" title={item.Name}>{item.Name}</p>
      </div>
    );
  };
  
  return (
    <div className="p-9 flex flex-wrap">{items.map(item => renderDetails(item))}</div>
  );
}

export default CollectionPage;