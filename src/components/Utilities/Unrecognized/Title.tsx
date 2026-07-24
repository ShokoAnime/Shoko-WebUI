import TabTitle from '@/components/Utilities/TabTitle';

const tabs = [
  { id: 'files', name: 'Unrecognized' },
  { id: 'manually-linked-files', name: 'Manually Linked' },
  { id: 'ignored-files', name: 'Ignored' },
];

const Title = () => <TabTitle basePath="../unrecognized" tabs={tabs} title="Unrecognized Files" />;

export default Title;
