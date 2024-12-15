import React from 'react';
import { useDispatch } from 'react-redux';
import { mdiTagTextOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';

import Button from '@/components/Input/Button';
import { resetFilter, setFilterTag } from '@/core/slices/collection';
import { addFilterCriteriaToStore } from '@/core/utilities/filter';
import useEventCallback from '@/hooks/useEventCallback';
import useNavigateVoid from '@/hooks/useNavigateVoid';

type Props = {
  tagType: 'User' | 'AniDB';
  text: string;
  type: 'Collection' | 'Series';
};

const TagButton = React.memo(({ tagType, text, type }: Props) => {
  const dispatch = useDispatch();
  const navigate = useNavigateVoid();
  const handleClick = useEventCallback(() => {
    dispatch(resetFilter());
    addFilterCriteriaToStore('HasTag').then(() => {
      dispatch(setFilterTag({ HasTag: [{ Name: text, isExcluded: false }] }));
      navigate('/webui/collection/filter/live');
    }).catch(console.error);
  });

  return (
    <Button
      className={cx(
        'font-semibold flex items-center border-2 border-panel-tags rounded-lg py-2 whitespace-nowrap capitalize h-fit cursor-pointer',
        tagType === 'User' ? 'text-panel-icon-important' : 'text-panel-icon-action',
        type === 'Collection' ? 'text-xs gap-x-2 px-2' : 'text-sm gap-x-3 px-3',
      )}
      onClick={handleClick}
    >
      <Icon path={mdiTagTextOutline} size={type === 'Collection' ? '1rem' : '1.25rem'} />
      <span className="text-panel-text transition-colors hover:text-panel-text-primary">{text}</span>
    </Button>
  );
});

export default TagButton;
