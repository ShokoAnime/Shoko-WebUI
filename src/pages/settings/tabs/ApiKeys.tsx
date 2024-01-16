import React, { useEffect, useState } from 'react';
import { mdiClipboardTextOutline, mdiInformationOutline } from '@mdi/js';
import { uniqueId } from 'lodash';
import { useCopyToClipboard } from 'usehooks-ts';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import { useCreateApiToken, useDeleteApiToken } from '@/core/react-query/auth/mutations';
import { useApiKeyQuery } from '@/core/react-query/auth/queries';
import useEventCallback from '@/hooks/useEventCallback';
import { useSettingsContext } from '@/pages/settings/SettingsPage';

import type { AuthToken } from '@/core/types/api/authToken';

const UserApiTokens = (prop: { userInfo: AuthToken, onDeleteToken?: () => void }) => {
  const { onDeleteToken, userInfo: { Device, Username } } = prop;
  const { mutate: deleteToken } = useDeleteApiToken();
  const onDeleteClick = useEventCallback(() => {
    deleteToken(Device);
    onDeleteToken?.();
  });

  return (
    <div className="flex flex-row justify-between">
      <div className="flex w-[65%] flex-col">
        <span className="font-light">{Username}</span>
        <span className="font-normal">{Device}</span>
      </div>
      <Button buttonType="danger" className="p-2.5" onClick={onDeleteClick}>
        Delete API Key
      </Button>
    </div>
  );
};

const ApiKeys = () => {
  const [keyValue, setKeyValue] = useState('');
  const [inputDisabled, setInputDisabled] = useState(false);
  const [, copy] = useCopyToClipboard();
  const { toggleToast } = useSettingsContext();
  const onKeyChange = useEventCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyValue(event.target.value);
  });

  const { data: createdToken, mutate: createApiToken } = useCreateApiToken();

  const handleCopyToClipboard = useEventCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    copy(keyValue);
  });

  const onGenerateClick = useEventCallback(() => {
    createApiToken(keyValue);
  });

  const { data: tokens, refetch } = useApiKeyQuery();

  const onTokenDelete = useEventCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refetch();
  });

  useEffect(() => {
    if (!createdToken) return;
    setKeyValue(_ => createdToken);
    setInputDisabled(_ => true);
    toggleToast({
      show: true,
      icon: mdiInformationOutline,
      title: 'Copy Your API Key!',
      message: 'You won\'t be able to copy this key anymore once you leave this page!',
    });
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    refetch();
  }, [createdToken, toggleToast, refetch]);

  return (
    <div className="flex flex-col gap-y-2">
      <div className="mb-3 text-xl font-semibold">Api Keys</div>
      <div className="text-lg font-semibold">
        Generate API Key
      </div>
      <div className="flex flex-row justify-between gap-x-2 border-b-2 border-panel-border pb-4">
        <Input
          id="key-input"
          endIcons={inputDisabled
            ? [{
              icon: mdiClipboardTextOutline,
              className: 'text-panel-text-secondary',
              onClick: handleCopyToClipboard,
            }]
            : undefined}
          className="w-full xl:w-[65%]"
          disabled={inputDisabled}
          inputClassName="px-4 py-3"
          onChange={onKeyChange}
          type="text"
          value={keyValue}
          placeholder="Input API Indentifier"
        />
        <Button
          buttonType="primary"
          className="px-2 font-semibold"
          onClick={onGenerateClick}
        >
          Generate API Key
        </Button>
      </div>
      <div className="text-lg font-semibold">
        Issued API Keys
      </div>
      <div className="my-4 flex flex-col gap-y-4">
        {tokens?.map(token => <UserApiTokens key={uniqueId()} userInfo={token} onDeleteToken={onTokenDelete} />)}
      </div>
    </div>
  );
};

export default ApiKeys;
