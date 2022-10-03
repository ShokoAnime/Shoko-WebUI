import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import ModalPanel from '../Panels/ModalPanel';
import { setStatus } from '../../core/slices/modals/editDashboard';

import { RootState } from '../../core/store';

function EditDashboardModal() {
  const dispatch = useDispatch();
  const status = useSelector((state: RootState) => state.modals.editDashboard.status);
  const handleClose = () => dispatch(setStatus(false));

  return (
    <ModalPanel
      show={status}
      className="pb-6"
      onRequestClose={() => handleClose()}
    >
      <div className="flex flex-col w-full border-l border-background-border drop-shadow-[4px_0_4px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col items-center justify-start bg-color-nav">
          HELLO WORLD
        </div>
      </div>
    </ModalPanel>
  );
}

export default EditDashboardModal;
