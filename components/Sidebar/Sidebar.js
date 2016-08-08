import React from 'react';
import Link from '../Link';

class Sidebar extends React.Component {
    render() {
        return (
            <aside>
                <div id="sidebar" className="nav-collapse ">
                    <ul className="sidebar-menu" id="nav-accordion">
                        <li>
                            <Link className="active" to="/dashboard">
                                <i className="fa fa-dashboard"/>
                                <span>Dashboard</span>
                            </Link>
                        </li>
                        <li className="sub-menu">
                            <a href="javascript:;" >
                                <i className="fa fa-laptop"/>
                                <span>Actions</span>
                            </a>
                        </li>
                        <li className="sub-menu">
                            <a href="javascript:;" >
                                <i className="fa fa-book"/>
                                <span>Import Folders</span>
                            </a>
                        </li>
                        <li className="sub-menu">
                            <a href="javascript:;" >
                                <i className="fa fa-cogs"/>
                                <span>Settings</span>
                            </a>
                        </li>
                        <li className="sub-menu">
                            <a href="javascript:;" >
                                <i className="fa fa-tasks"/>
                                <span>Interactive Log</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </aside>
        );
    }
}

export default Sidebar;

