import React from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { mdiChevronLeft, mdiChevronRight, mdiLoading } from '@mdi/js';
import { Icon } from '@mdi/react';
import { flatMap, map } from 'lodash';

import Button from '@/components/Input/Button';
import ModalPanel from '@/components/Panels/ModalPanel';
import useToggleModalKeybinds from '@/hooks/useToggleModalKeybinds';

import DuplicatesInfo from './DuplicatesInfo';

import type { FileType } from '@/core/types/api/file';

type Props = {
  onClose: () => void;
  show: boolean;
  count: number;
  files: FileType[];
  index: number;
  isFetching: boolean;
  onChange: (type: 'previous' | 'next') => void;
  subheader?: string;
};

type FooterProps = Pick<Props, 'count' | 'index' | 'onChange' | 'onClose'>;

const Footer = ({ count, index, onChange, onClose }: FooterProps) => (
  <div className="flex items-center justify-between">
    <div className="flex gap-x-2">
      <Button onClick={() => onChange('previous')} disabled={index === 0}>
        <Icon path={mdiChevronLeft} size={1.5} className="text-panel-icon-action" />
      </Button>
      <div className="flex items-center">
        {index + 1}
        &nbsp;/&nbsp;
        {count}
      </div>
      <Button onClick={() => onChange('next')} disabled={index === count - 1}>
        <Icon path={mdiChevronRight} size={1.5} className="text-panel-icon-action" />
      </Button>
    </div>
    <Button buttonType="secondary" buttonSize="normal" onClick={onClose}>
      Close
    </Button>
  </div>
);

const DuplicateFilesModal = (props: Props) => {
  const { count, files, index, isFetching, onChange, onClose, show, subheader } = props;

  useToggleModalKeybinds(show, 'modal');
  useToggleModalKeybinds(!show, 'primary');
  useHotkeys('enter, escape', onClose, { scopes: 'modal' });
  useHotkeys('left', () => onChange('previous'), { scopes: 'modal' });
  useHotkeys('right', () => onChange('next'), { scopes: 'modal' });

  if (!show) return null;

  return (
    <ModalPanel
      show={show}
      size="xl"
      onRequestClose={onClose}
      header="Duplicate Files"
      subHeader={subheader && <div className="text-sm opacity-65">{subheader}</div>}
      footer={
        <Footer
          count={count}
          index={index}
          onChange={onChange}
          onClose={onClose}
        />
      }
      fullHeight
    >
      <div className="flex h-full flex-col gap-y-4 overflow-y-auto pr-2">
        {isFetching && (
          <div className="flex h-full items-center justify-center text-panel-text-primary">
            <Icon path={mdiLoading} size={4} spin />
          </div>
        )}

        {!isFetching && flatMap(files, file =>
          map(file.Locations, location => (
            <DuplicatesInfo
              key={location.ID}
              file={file}
              location={location}
            />
          )))}
      </div>
    </ModalPanel>
  );
};

export default DuplicateFilesModal;
