/*
 *
 * HomePage
 *
 */

import React, { useEffect, useState, memo, useMemo } from 'react';
import { request } from 'strapi-helper-plugin';
// import PropTypes from 'prop-types';
// import pluginId from '../../pluginId';
import DataView from '../DataView';
import LeftMenu from '../LeftMenu';
import GlobalStyle from './GlobalStyles';

const HomePage = () => {
  const [models, setModels] = useState([]);
  const [activeModel, setActiveModel] = useState({});
  const [modelData, setModelData] = useState([]);

  useEffect(() => {
    // fetch all models
    request(`/strapi-plugin-elastic/models`, {
      method: 'GET',
    }).then((res) => {
      if (res && res.length && res.length > 0) {
        setModels(res);
        setActiveModel(res[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (activeModel && activeModel.index) {
      // fetch for the model data
      request(`/strapi-plugin-elastic/model?index=${activeModel.index}`, {
        method: 'GET',
      }).then((res) => setModelData(res.data));
    }
  }, [activeModel]);

  return (
    <div className="row">
      <GlobalStyle />
      <LeftMenu
        models={models}
        activeModel={activeModel}
        setActiveModel={setActiveModel}
      />
      <DataView data={modelData} />
    </div>
  );
};

export default memo(HomePage);
