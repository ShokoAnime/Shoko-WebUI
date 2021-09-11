import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import Button from '../src/components/Input/Button';

export default {
  title: 'Controls/Button',
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = args => <Button {...args}>{args.children}</Button>;

export const Primary = Template.bind({});
Primary.args = {
  className: 'button-color-primary',
  children: 'Button',
};

export const Loading = Template.bind({});
Loading.args = {
  children: 'Button',
  loading: true,
};

export const Danger = Template.bind({});
Danger.args = {
  className: 'bg-color-danger',
  children: 'Button',
};
