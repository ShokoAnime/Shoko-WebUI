import React, { useLayoutEffect, useState } from 'react';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import ModalPanel from '@/components/Panels/ModalPanel';
import toast from '@/components/Toast';
import { useAddPluginPackageRepositoryMutation } from '@/core/react-query/plugin-package/mutations';

type Props = {
  show: boolean;
  onClose: () => void;
};

const RepositoryForm = ({ onClose, show }: Props) => {
  const { isPending, mutate: addRepository } = useAddPluginPackageRepositoryMutation();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const reset = () => {
    setName('');
    setUrl('');
  };

  useLayoutEffect(() => {
    if (!show) return;
    reset();
  }, [show]);

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) {
      toast.warning('Repository details required', 'Provide both a repository name and manifest URL.');
      return;
    }

    try {
      const repositoryUrl = new URL(url.trim());

      if (repositoryUrl.protocol !== 'http:' && repositoryUrl.protocol !== 'https:') {
        toast.warning('Invalid repository URL', 'Repository URLs must use http or https.');
        return;
      }
    } catch {
      toast.warning('Invalid repository URL', 'Provide a valid repository manifest URL.');
      return;
    }

    addRepository({ name: name.trim(), url: url.trim() }, {
      onSuccess: () => {
        toast.success('Repository added', `${name.trim()} has been added.`);
        reset();
        onClose();
      },
    });
  };

  return (
    <ModalPanel
      show={show}
      onRequestClose={onClose}
      size="sm"
      header="Add Repository"
    >
      <div className="flex flex-col gap-y-3">
        <Input
          id="plugin-repository-name"
          type="text"
          label="Name"
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Community Plugins"
        />
        <Input
          id="plugin-repository-url"
          type="text"
          label="Manifest URL"
          value={url}
          onChange={event => setUrl(event.target.value)}
          placeholder="https://example.com/manifest.json"
        />
      </div>
      <div className="mt-6 flex justify-end gap-x-3">
        <Button buttonType="secondary" buttonSize="normal" onClick={onClose}>
          Cancel
        </Button>
        <Button buttonType="primary" buttonSize="normal" onClick={handleSubmit} loading={isPending}>
          Add Repository
        </Button>
      </div>
    </ModalPanel>
  );
};

export default RepositoryForm;
