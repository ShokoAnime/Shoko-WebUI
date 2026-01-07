import React from 'react';
import { useTranslation } from 'react-i18next';

const UpdateFrequencyValues = () => {
  const { t } = useTranslation('settings');
  return (
    <>
      <option value={1}>{t('frequency.never')}</option>
      <option value={2}>{t('frequency.6hours')}</option>
      <option value={3}>{t('frequency.12hours')}</option>
      <option value={4}>{t('frequency.24hours')}</option>
      <option value={5}>{t('frequency.week')}</option>
      <option value={6}>{t('frequency.month')}</option>
    </>
  );
};

export default UpdateFrequencyValues;
