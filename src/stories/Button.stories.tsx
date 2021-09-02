import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from '../components/Input/Button';

export default {
  title: 'Controls/Button',
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = args => <Button {...args}>{args.label}</Button>;

export const Primary = Template.bind({});
Primary.args = {
  className: 'button-color-primary',
  label: 'Button',
};

export const Loading = Template.bind({});
Loading.args = {
  label: 'Button',
  loading: true,
};

export const Danger = Template.bind({});
Danger.args = {
  className: 'bg-color-danger',
  label: 'Button',
};
