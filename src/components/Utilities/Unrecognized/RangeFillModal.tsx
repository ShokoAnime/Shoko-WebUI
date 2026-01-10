import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Input/Button';
import InputSmall from '@/components/Input/InputSmall';
import SelectSmall from '@/components/Input/SelectSmall';
import ModalPanel from '@/components/Panels/ModalPanel';

type Props = {
  show: boolean;
  onClose: () => void;
  rangeFill: (rangeStart: string, epType: string) => void;
};

const RangeFillModal = ({ onClose, rangeFill, show }: Props) => {
  const { t } = useTranslation('links');
  const [rangeStart, setRangeStart] = useState('');
  const [epType, setEpType] = useState('Normal');

  const handleFill = () => {
    rangeFill(rangeStart, epType);
    onClose();
  };

  return (
    <ModalPanel
      show={show}
      size="sm"
      onRequestClose={onClose}
      header={t('rangeFillModal.rangeFillOptions')}
    >
      <div className="flex flex-col gap-y-2">
        <SelectSmall
          label={t('rangeFillModal.type')}
          id="Type"
          value={epType}
          onChange={event => setEpType(event.target.value)}
        >
          <option value="Normal">{t('rangeFillModal.episode')}</option>
          <option value="Special">{t('rangeFillModal.special')}</option>
          <option value="Other">{t('rangeFillModal.other')}</option>
        </SelectSmall>
        <div className="flex items-center justify-between">
          {t('rangeFillModal.rangeStartNumber')}
          <InputSmall
            id="RangeStart"
            type="number"
            value={rangeStart}
            onChange={event => setRangeStart(event.target.value)}
            className="w-16 px-3 py-1 text-center"
          />
        </div>
      </div>
      <div className="flex justify-end gap-x-3 font-semibold">
        <Button onClick={onClose} buttonType="secondary" className="px-5 py-2">{t('rangeFillModal.cancel')}</Button>
        <Button onClick={handleFill} buttonType="primary" className="px-5 py-2" disabled={!rangeStart}>
          {t('rangeFillModal.fill')}
        </Button>
      </div>
    </ModalPanel>
  );
};

export default RangeFillModal;
