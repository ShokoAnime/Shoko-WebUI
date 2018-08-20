// @flow
import React from 'react';
import { Content, Image, Heading, Media } from 'react-bulma-components';
import Link from '../Link/Link';


class Logo extends React.Component<{}> {
  render() {
    return (
      <Media>
        <Media.Item renderAs="figure" className="image is-48x48" position="left">
          <img alt="" src="/logo.png" />
        </Media.Item>
        <Media.Item>
          <Content>
            <Heading size={4}>Shoko</Heading>
            <Heading subtitle size={6}>Server</Heading>
          </Content>
        </Media.Item>
      </Media>
    );
  }
}

export default Logo;
