import React, { useState } from 'react';

import Button from '@/components/Input/Button';
import Input from '@/components/Input/Input';
import toast from '@/components/Toast';
import { useAddPluginPackageRepositoryMutation } from '@/core/react-query/plugin-package/mutations';

const RepositoryForm = () => {
  const { mutate: addRepository, status } = useAddPluginPackageRepositoryMutation();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');

  const reset = () => {
    setName('');
    setUrl('');
  };

  const handleSubmit = () => {
    if (!name.trim() || !url.trim()) {
      toast.warning('Repository details required', 'Provide both a repository name and manifest URL.');
      return;
    }

    addRepository({ name: name.trim(), url: url.trim() }, {
      onSuccess: () => {
        toast.success('Repository added', `${name.trim()} has been added.`);
        reset();
      },
    });
  };

  return (
    <div className="rounded-lg border border-panel-border bg-panel-input p-3">
      <div className="mb-3 text-lg font-semibold">Add Repository</div>
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
        <div className="flex justify-end">
          <Button buttonType="primary" buttonSize="normal" onClick={handleSubmit} loading={status === 'pending'}>
            Add Repository
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RepositoryForm;
