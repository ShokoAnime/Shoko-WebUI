import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import SideMenu from '../components/Layout/SideMenu';
import { Default as MenuItemDefaults } from './MenuItem.stories';

export default {
  title: 'Layout/SideMenu',
  component: SideMenu,
} as ComponentMeta<typeof SideMenu>;

const Template: ComponentStory<typeof SideMenu> = args => <SideMenu {...args} />;

export const Default = Template.bind({});
Default.args = {
  items: [
    { ...MenuItemDefaults.args, icon: 'dashboard', label: 'Dashboard' },
    { ...MenuItemDefaults.args, icon: 'collection', label: 'Collection' },
    { ...MenuItemDefaults.args, icon: 'utilities', label: 'Utilities' },
    { ...MenuItemDefaults.args, icon: 'actions', label: 'Actions' },
    { ...MenuItemDefaults.args, icon: 'log', label: 'Log' },
    { ...MenuItemDefaults.args, icon: 'settings', label: 'Settings' },
  ],
};
