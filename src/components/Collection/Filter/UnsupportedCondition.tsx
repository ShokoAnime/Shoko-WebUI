import { mdiMinusCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';

import type { UnsupportedNode } from '@/core/types/api/filter';

type Props = {
  node: UnsupportedNode;
  onRemove: () => void;
};

// Function calls and comparison operators over typed selectors (Today/DateAdd/DateDiff,
// NumberGreaterThan, etc.) are a permanent product boundary, not a gap to close later -
// see the "advanced logic" wording below, which deliberately avoids implying this will
// become editable in a future update.
const UnsupportedCondition = ({ node, onRemove }: Props) => (
  <div className="flex flex-col">
    <div className="mb-3 flex items-center justify-between">
      <div className="font-semibold">{node.raw.Type}</div>
      <div onClick={onRemove}>
        <Icon
          className="cursor-pointer text-panel-icon-danger"
          path={mdiMinusCircleOutline}
          size={1}
          data-tooltip-id="tooltip"
          data-tooltip-content="Remove Condition"
          data-tooltip-delay-show={500}
        />
      </div>
    </div>
    <div className="rounded-lg border border-panel-border bg-panel-input px-4 py-3 text-panel-text-important">
      This condition uses advanced logic that can&apos;t be edited here. It will be kept as-is when you save.
    </div>
  </div>
);

export default UnsupportedCondition;
