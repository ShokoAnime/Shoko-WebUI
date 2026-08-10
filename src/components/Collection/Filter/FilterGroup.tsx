import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { mdiFilterPlusOutline, mdiMinusCircleOutline, mdiPlusCircleMultipleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import cx from 'classnames';
import { map } from 'lodash';

import AddCriteriaModal from '@/components/Collection/Filter/AddCriteriaModal';
import FilterLeaf from '@/components/Collection/Filter/FilterLeaf';
import UnsupportedCondition from '@/components/Collection/Filter/UnsupportedCondition';
import Select from '@/components/Input/Select';
import { addGroup, removeNode, setGroupOperator, setNegate } from '@/core/slices/collection';
import { useDispatch } from '@/core/store';

import type { FilterExpression, GroupNode } from '@/core/types/api/filter';

type Props = {
  catalog: FilterExpression[];
  isRoot?: boolean;
  node: GroupNode;
};

// Progressive disclosure: the root of a plain, non-negated AND tree - what "+ Add
// condition" alone ever produces - renders bare, matching the flat sidebar this replaces.
// Chrome (the Match ALL/ANY dropdown, NOT toggle) only shows up when it's either load-
// bearing (a loaded preset whose root really is Or/negated) or the user explicitly opted
// into nesting by adding a group, since a nested group's own join word is never optional.
const FilterGroup = ({ catalog, isRoot = false, node }: Props) => {
  const dispatch = useDispatch();
  const [showAddCondition, setShowAddCondition] = useState(false);

  const showChrome = !isRoot || node.operator === 'Or' || node.negate;

  const changeOperator = (event: ChangeEvent<HTMLSelectElement>) => {
    dispatch(setGroupOperator({ nodeId: node.id, operator: event.currentTarget.value as 'And' | 'Or' }));
  };

  const toggleNegate = () => dispatch(setNegate({ nodeId: node.id, negate: !node.negate }));
  const removeGroup = () => dispatch(removeNode(node.id));
  const addSubGroup = () => dispatch(addGroup({ groupId: node.id }));

  return (
    <div className={cx('flex flex-col gap-y-4', !isRoot && 'rounded-lg border border-panel-border p-4')}>
      {showChrome && (
        <div className="flex items-center justify-between gap-x-2">
          <div className="flex items-center gap-x-2">
            <span
              className={cx(
                'cursor-pointer rounded-sm border px-1.5 text-xs font-semibold',
                node.negate
                  ? 'border-panel-icon-danger text-panel-icon-danger'
                  : 'border-panel-border text-panel-text-important',
              )}
              onClick={toggleNegate}
              data-tooltip-id="tooltip"
              data-tooltip-content="Toggle NOT"
              data-tooltip-delay-show={500}
            >
              NOT
            </span>
            <Select id={`${node.id}-operator`} value={node.operator} onChange={changeOperator}>
              <option value="And">Match All of the following</option>
              <option value="Or">Match Any of the following</option>
            </Select>
          </div>
          {!isRoot && (
            <div onClick={removeGroup}>
              <Icon
                className="cursor-pointer text-panel-icon-danger"
                path={mdiMinusCircleOutline}
                size={1}
                data-tooltip-id="tooltip"
                data-tooltip-content="Remove Group"
                data-tooltip-delay-show={500}
              />
            </div>
          )}
        </div>
      )}

      {map(node.children, (child) => {
        if (child.kind === 'group') {
          return <FilterGroup key={child.id} catalog={catalog} node={child} />;
        }
        if (child.kind === 'unsupported') {
          return <UnsupportedCondition key={child.id} node={child} onRemove={() => dispatch(removeNode(child.id))} />;
        }
        const catalogEntry = catalog.find(entry => entry.Expression === child.expression);
        if (!catalogEntry) return null;
        return <FilterLeaf key={child.id} catalogEntry={catalogEntry} node={child} />;
      })}

      <div className="flex items-center gap-x-4">
        <div
          className="flex cursor-pointer items-center gap-x-2 font-semibold text-panel-text-primary"
          onClick={() => setShowAddCondition(true)}
        >
          <Icon path={mdiFilterPlusOutline} size={0.85} />
          Add condition
        </div>
        <div
          className="flex cursor-pointer items-center gap-x-2 text-sm text-panel-text-important"
          onClick={addSubGroup}
        >
          <Icon path={mdiPlusCircleMultipleOutline} size={0.75} />
          Add group
        </div>
      </div>

      <AddCriteriaModal groupId={node.id} show={showAddCondition} onClose={() => setShowAddCondition(false)} />
    </div>
  );
};

export default FilterGroup;
