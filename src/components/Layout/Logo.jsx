// @flow
import React from 'react';
import {
  Level, Content, Image, Element,
} from 'react-bulma-components';


class Logo extends React.Component<{}> {
  render() {
    return (
      <Level>
        <Level.Item>
          <Image src="/webui/logo.png" className="image is-48x48" />
        </Level.Item>
        <Level.Item>
          <Content>
            <Element renderAs="span" className="title" textSize={6}>Shoko</Element>
            <Element renderAs="span" className="subtitle" textSize={4}>Server</Element>
          </Content>
        </Level.Item>
      </Level>
    );
  }
}

export default Logo;
