import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import { Icon } from '@mdi/react';
import { mdiChevronRight } from '@mdi/js';

import ModalPanel from '../Panels/ModalPanel';
import { setStatus } from '../../core/slices/modals/utilities';

import { RootState } from '../../core/store';

function UtilitiesModal() {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.modals.utilities.status);

  const handleClose = () => dispatch(setStatus(false));

  const renderLink = (key: string, name: string) => {
    const uri = `/webui/utilities/${key}`;

    return (
      <Link key={key} to={uri} className={cx(['flex justify-between w-full py-2 px-4 bg-background-alt border-b-2 border-background-border font-semibold'])} onClick={handleClose}>
        {name}
        <Icon path={mdiChevronRight} size={1}/>
      </Link>
    );
  };

  return (
    <ModalPanel
      show={status}
      className="pb-6 drop-shadow-[4px_0_4px_rgba(0,0,0,0.25)]"
      onRequestClose={() => handleClose()}
    >
      <div className="flex flex-col w-full border-l border-background-border p-6">
        <div className="flex flex-col items-center justify-start bg-color-nav">
          {renderLink('unrecognized', 'Unrecognized')}
          {/*{renderLink('multiple-files', 'Multiple Files')}*/}
          {/*{renderLink('missing-episodes', 'Missing Episodes')}*/}
          {renderLink('series-without-files', 'Series Without Files')}
          {/*{renderLink('file-renaming', 'File Renaming')}*/}
        </div>
      </div>
    </ModalPanel>
  );
}

export default UtilitiesModal;
