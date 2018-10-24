// @flow
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Section, Tile, Button } from 'react-bulma-components';
import Layout from '../../components/Layout/Layout';
import Overview from '../dashboard/Overview';
import Events from '../../core/events';
import { getSettings } from '../../core/actions/settings/Api';
import { faThumbtack } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type Props = {};

const actions = [
  'Action 1',
  'Action 2',
  'Action 3',
  'Action 4',
  'Action 5',
  'Action 6',
];

class ActionsPage extends React.Component<Props> {
  renderAction = action => (
    <React.Fragment>
      <Tile kind="parent" size={4}>
        <Tile color="primary" kind="child">
          <FontAwesomeIcon icon={faThumbtack} alt="" />
          {action}
        </Tile>
      </Tile>
    </React.Fragment>
  );

  render() {
    return (
      <Layout>
        <Overview />
        <Section>
          <Tile kind="ancestor">
            {actions.map(this.renderAction)}
          </Tile>
        </Section>
      </Layout>
    );
  }
}

function mapStateToProps() {
  return {};
}

function mapDispatchToProps(dispatch) {
  return {
    loadSettings: () => {
      dispatch({ type: Events.PAGE_SETTINGS_LOAD, payload: null });
      dispatch(getSettings());
      dispatch({ type: Events.SETTINGS_GET_SERVER, payload: null });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionsPage);
