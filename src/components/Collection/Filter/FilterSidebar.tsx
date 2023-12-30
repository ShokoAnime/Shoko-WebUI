import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { filter, keys, map } from 'lodash';

import DefaultCriteria from '@/components/Collection/Filter/DefaultCriteria';
import Select from '@/components/Input/Select';
import ShokoPanel from '@/components/Panels/ShokoPanel';
import { addFilterCriteria } from '@/core/slices/collection';
import { useFilterExpressionMain } from '@/hooks/filters';

import type { RootState } from '@/core/store';

const FilterSidebar = () => {
  const allCriteria = useFilterExpressionMain();
  const [newCriteria, setNewCriteria] = useState('');
  const dispatch = useDispatch();
  const selectedCriteria = useSelector((state: RootState) => state.collection.filterCriteria);
  const unusedCriteria = useMemo(() => {
    const selectedKeys = keys(selectedCriteria);
    return filter(allCriteria, item => selectedKeys.indexOf(item.Expression) === -1);
  }, [allCriteria, selectedCriteria]);

  useEffect(() => {
    if (!allCriteria[0]) return;
    setNewCriteria(allCriteria[0]?.Expression ?? '');
  }, [allCriteria]);

  const addCriteria = () => {
    const filterExpression = filter(allCriteria, { Expression: newCriteria })[0];
    dispatch(addFilterCriteria(filterExpression));
  };

  return (
    <ShokoPanel title="Filter" className="ml-8 w-full" contentClassName="gap-3">
      {map(selectedCriteria, item => <DefaultCriteria key={item.Expression} criteria={item} />)}
      <Select
        id="addCondition"
        label="Select Condition"
        value={newCriteria}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          setNewCriteria(event.currentTarget.value);
        }}
        options={
          <div
            onClick={() => {
              addCriteria();
            }}
          >
            <Icon className="cursor-pointer text-panel-icon-important" path={mdiPlusCircleOutline} size={1} />
          </div>
        }
      >
        {map(unusedCriteria, (item) => {
          const value = item?.Expression;
          return <option key={value} value={value}>{item.Name}</option>;
        })}
      </Select>
    </ShokoPanel>
  );
};

export default FilterSidebar;
