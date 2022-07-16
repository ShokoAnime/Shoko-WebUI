import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import MenuItem from '../src/components/Layout/MenuItem';

export default {
  title: 'Layout/MenuItem',
  component: MenuItem,
} as ComponentMeta<typeof MenuItem>;

const Template: ComponentStory<typeof MenuItem> = args => <MenuItem {...args}>{args.label}</MenuItem>;

export const Default = Template.bind({});
Default.args = {
  icon: 'settings',
  label: 'Settings',
};
