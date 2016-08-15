import React from 'react';
import cx from 'classnames';
import Link from '../Link/Link';
import s from './Sidebar.css';
import history from '../../core/history';

class Sidebar extends React.Component {
  render() {
    const location = history.getCurrentLocation().pathname;

    return (
      <aside>
        <div id="sidebar" className="nav-collapse ">
          <ul className="sidebar-menu" id="nav-accordion">
            <li>
              <Link className={cx({ active: location === '/dashboard' })} to="/dashboard">
                <i className="fa fa-home" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li className="sub-menu">
              <a>
                <i className="fa fa-list-ol" />
                <span>Actions</span>
              </a>
            </li>
            <li className="sub-menu">
              <Link className={cx({ active: location === '/import-folders' })} to="/import-folders">
                <i className="fa fa-folder" />
                <span>Import Folders</span>
              </Link>
            </li>
            <li className="sub-menu">
              <a>
                <i className="fa fa-wrench" />
                <span>Settings</span>
              </a>
            </li>
            <li className="sub-menu">
              <a>
                <i className="fa fa-file-text" />
                <span>Interactive Log</span>
              </a>
            </li>
          </ul>
          <div className={cx(s.bottom)}>
            <a href="http://www.jmediamanager.org/" rel="noopener noreferrer" target="_blank">Home</a>
            <a
              href="https://github.com/japanesemediamanager/jmmserver-webui"
              target="_blank"
              rel="noopener noreferrer"
            >Github</a>
            <a
              href="https://github.com/japanesemediamanager/jmmserver-webui/issues"
              target="_blank"
              rel="noopener noreferrer"
            >Support</a>
          </div>
        </div>
      </aside>
    );
  }
}

export default Sidebar;

