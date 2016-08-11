import React, {PropTypes} from 'react';
import history from '../../core/history';
import store from '../../core/store';
import { queueStatusAsync, recentFilesAsync, importFoldersAsync, seriesCountAsync, filesCountAsync, jmmNewsAsync, updateAvailableAsync } from '../../core/actions';
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


        queueStatusAsync()
          .then(
            () => recentFilesAsync()
          .then(() => importFoldersAsync())
          .then(() => seriesCountAsync())
          .then(() => filesCountAsync())
          .then(() => jmmNewsAsync())
          .then(() => updateAvailableAsync())
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