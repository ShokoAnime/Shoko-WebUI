import TabTitle from '@/components/Utilities/TabTitle';

const tabs = [
  { id: 'linked', name: 'Linked' },
  { id: 'unrecognized', name: 'Unrecognized' },
];

const Title = () => <TabTitle basePath="../duplicate-files" tabs={tabs} title="Duplicate Files" />;

export default Title;
