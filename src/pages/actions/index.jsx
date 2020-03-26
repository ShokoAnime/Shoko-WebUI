// @flow
import React from 'react';
import { connect } from 'react-redux';
import { chunk } from 'lodash';
import { Columns, Section } from 'react-bulma-components';
import {
  ControlGroup, Button, Label, Classes,
} from '@blueprintjs/core';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Layout from '../../components/Layout/Layout';
import Overview from '../dashboard/Overview';
import { getSettings } from '../../core/actions/settings/Api';
import FixedPanel from '../../components/Panels/FixedPanel';
import QuickActionName from './QuickActionName';
import { setStatus, setAction } from '../../core/actions/modals/QuickActions';
import QuickActionModal from '../../components/Dialogs/QuickActionModal';
import Events from '../../core/events';

type Props = {
  pinAction: (string) => void,
  loadSettings: () => void,
};

const actions = [
  ['Import', ['folder-import', 'folder-scan', 'remove-missing-files']],
  ['Update Info', ['stats-update', 'mediainfo-update']],
  ['Rescan', ['rescanunlinked', 'rescanmanuallinks', 'rehashunlinked', 'rehashmanuallinks']],
  ['AniDB', ['core-anidb-votes-sync', 'core-anidb-list-sync', 'core-anidb-update', 'core-anidb-updatemissingcache']],
  ['Trakt', ['core-trakt-sync', 'core-trakt-scan']],
  ['TvDB', ['core-tvdb-update', 'core-tvdb-regenlinks', 'core-tvdb-checklinks']],
  ['MovieDB', ['core-moviedb-update']],
  ['Images', ['core-images-update', 'image-validateall']],
  ['Plex', ['plex-sync']],
];

class ActionsPage extends React.Component<Props> {
  componentDidMount() {
    const { loadSettings } = this.props;
    loadSettings();
  }

  renderAction = (action) => {
    const { pinAction, handleAction } = this.props;
    return (
      <ControlGroup fill id={action} key={action}>
        <Button onClick={() => pinAction(action)} className={Classes.FIXED}><FontAwesomeIcon icon={faThumbtack} alt="" /></Button>
        <Label className={Classes.INLINE}><QuickActionName id={action} /></Label>
        <Button onClick={() => handleAction(action)} className={Classes.FIXED}>Run</Button>
      </ControlGroup>
    );
  };

  renderGroup = group => (
    <Columns.Column size={4}>
      <FixedPanel title={group[0]} className="quick-action">
        {group[1].map(this.renderAction)}
      </FixedPanel>
    </Columns.Column>
  );

  renderColumns = actionsChunk => (
    <Columns>
      {actionsChunk.map(this.renderGroup)}
    </Columns>
  );

  render() {
    return (
      <Layout>
        <Section className="actions page-wrap">
          <Overview />
          {chunk(actions, 3).map(this.renderColumns)}
        </Section>
        <QuickActionModal />
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
      dispatch(getSettings());
    },
    pinAction: (value) => {
      dispatch(setAction(value));
      dispatch(setStatus(true));
    },
    handleAction: (value) => {
      dispatch({ type: Events.RUN_QUICK_ACTION, payload: value });
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ActionsPage);
