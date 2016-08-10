import React, {PropTypes} from 'react';
import history from '../../core/history';
import store from '../../core/store';
import { fetchQueues, fetchRecentFiles, fetchImportFolders, fetchSeriesCount, fetchFilesCount, fetchJmmNews, fetchUpdateAvailableIfNeeded } from '../../core/actions';
import Layout from '../../components/Layout';
import Footer from '../../components/Layout/Footer';
import Overview from './Overview';
import Commands from './Commands';
import RecentFiles from './RecentFiles';
import News from './News';
import ImportFolders from './ImportFolders';
import QuickActions from './QuickActions';


class MainPage extends React.Component {
    componentDidMount() {
        const state = store.getState();
        if (state.activeApiKey == '') {
            history.push({
                pathname: '/',
            });
            return;
        }
        store.dispatch(fetchQueues(state.activeApiKey))
          .then(() => store.dispatch(fetchRecentFiles(state.activeApiKey))
          .then(() => store.dispatch(fetchImportFolders(state.activeApiKey)))
          .then(() => store.dispatch(fetchSeriesCount(state.activeApiKey)))
          .then(() => store.dispatch(fetchFilesCount(state.activeApiKey)))
          .then(() => store.dispatch(fetchJmmNews(state.activeApiKey)))
          .then(() => fetchUpdateAvailableIfNeeded()(store.dispatch, store.getState))
        );

    }

    render() {
        return (
            <Layout>
                <section className="main-content">
                    <section className="wrapper">
                        <Overview/>
                        <div className="row">
                            <Commands className="col-sm-4"/>
                            <RecentFiles className="col-sm-8"/>
                        </div>
                        <div className="row">
                            <News className="col-sm-4"/>
                            <QuickActions className="col-sm-4"/>
                            <ImportFolders className="col-sm-4"/>
                        </div>
                    </section>
                    <Footer/>
                </section>
            </Layout>
        );
    }
}

export default MainPage;