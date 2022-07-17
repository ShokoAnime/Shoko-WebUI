import React, { useState } from 'react';
import moment from 'moment';
import cx from 'classnames';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../core/store';

function UnrecognizedAvdumpedItem({ item }) {
  const avdumpList = useSelector((state: RootState) => state.mainpage.avdump);
  const [activeTab, setActiveTab] = useState('date');
    
  return (<div className="flex flex-col grow">
      <div>
          <span className={cx({ 'font-semibold': activeTab === 'date', 'text-highlight-1': activeTab === 'date' })} onClick={() => { setActiveTab('date');}}>{moment(item.Created).format('yyyy-MM-DD')} / {moment(item.Created).format('hh:mm A')}</span>
          <span className="mx-2">|</span>
          <span className={cx({ 'font-semibold': activeTab === 'ed2k', 'text-highlight-1': activeTab === 'ed2k' })} onClick={() => { setActiveTab('ed2k');}}>ED2KHash</span>
      </div>
      {activeTab === 'date' && <span className="flex break-words">{item.Locations[0].RelativePath}</span>}
      {activeTab === 'ed2k' && <span className="flex break-words">{avdumpList[item.ID]?.hash || ''}</span>}
  </div>);
}

export default UnrecognizedAvdumpedItem;