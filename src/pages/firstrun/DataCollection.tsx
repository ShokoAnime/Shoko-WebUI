import React from 'react';

import Footer from './Footer';
import Checkbox from '../../components/Input/Checkbox';

type State = {
  collectData: boolean,
};

class DataCollection extends React.Component<{}, State> {
  state = {
    collectData: false,
  };

  handleInputChange = (event: any) => {
    const name = event.target.id;
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    this.setState(prevState => Object.assign(prevState, { [name]: value }));
  };

  render() {
    const { collectData } = this.state;
    return (
      <React.Fragment>
        <div className="flex flex-col flex-grow p-10">
          <div className="font-bold text-lg">Data Collection</div>
          <div className="font-muli mt-5">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
            dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
            mollit anim id est laborum.
          </div>
          <div className="flex items-center mt-12">
            <span className="flex mr-6">Allow Shoko To Collect Anonymous Data</span>
            <span className="flex">
              <Checkbox id="collectData" isChecked={collectData} onChange={this.handleInputChange} />
            </span>
          </div>
        </div>
        <Footer prevTabKey="import-folders" nextTabKey="" finish />
      </React.Fragment>
    );
  }
}

export default DataCollection;
