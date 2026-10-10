import type { ReactNode } from 'react';
import { mdiLoading, mdiMinusCircleOutline, mdiPlusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import DnDList from '@/components/DnDList/DnDList';
import Button from '@/components/Input/Button';

import type { DropResult } from '@hello-pangea/dnd';

type Props = {
  label: string;
  /** The keys in order, each shown with its own content. */
  items: { key: string, content: ReactNode }[];
  onOrderChange: (keys: string[]) => void;
  onAdd: () => void;
  addTooltip: string;
  isPending?: boolean;
  /** Shown in place of the list when what it needs failed to load. */
  errorMessage?: string;
  emptyStateMessage?: string;
};

/** An ordered list that is dragged to reorder, with a button to add to it and one to remove each entry. */
const OrderList = ({
  addTooltip,
  emptyStateMessage,
  errorMessage,
  isPending = false,
  items,
  label,
  onAdd,
  onOrderChange,
}: Props) => {
  const keys = items.map(item => item.key);
  const isReady = !isPending && !errorMessage;

  const onDragEnd = (result: DropResult) => {
    if (!result.destination || result.destination.index === result.source.index) return;

    const reordered = [...keys];
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    onOrderChange(reordered);
  };

  const removeItem = (key: string) => {
    onOrderChange(keys.filter(item => item !== key));
  };

  return (
    <div className="flex flex-col gap-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1">
          {label}
          {items.length > 0 && <span className="text-xs opacity-65">(Drag to Reorder)</span>}
        </div>
        <Button disabled={!isReady} onClick={onAdd} tooltip={addTooltip}>
          <Icon className="text-panel-icon-action" path={mdiPlusCircleOutline} size={1} />
        </Button>
      </div>
      <div className="flex min-h-10 rounded-lg border border-panel-border bg-panel-input px-4 py-2">
        {isPending && <Icon path={mdiLoading} spin size={3} className="mx-auto text-panel-text-primary" />}

        {errorMessage && <div className="text-sm text-panel-text-danger">{errorMessage}</div>}

        {isReady && items.length > 0
          && (
            <DnDList onDragEnd={onDragEnd}>
              {items.map(({ content, key }) => (
                {
                  key,
                  item: (
                    <div className="flex items-center justify-between py-1">
                      {content}
                      <Button onClick={() => removeItem(key)} tooltip="Remove">
                        <Icon className="text-panel-icon-action" path={mdiMinusCircleOutline} size={1} />
                      </Button>
                    </div>
                  ),
                }
              ))}
            </DnDList>
          )}
        {isReady && items.length === 0
          && emptyStateMessage
          && <div className="text-sm opacity-65">{emptyStateMessage}</div>}
      </div>
    </div>
  );
};

export default OrderList;
