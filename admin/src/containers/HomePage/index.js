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
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);

  const onChangeParams = ({ target }) => {
    if (target.name === 'params._page') {
      setPage(target.value);
    }
  };

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
      setLoading(true);
      request(
        `/strapi-plugin-elastic/model?index=${activeModel.index}&page=${page}&limit=${limit}`,
        {
          method: 'GET',
        }
      )
        .then((res) => setModelData(res.data))

        .finally(() => setLoading(false));
    }
  }, [activeModel, page]);

  return (
    <div className="row">
      <GlobalStyle />
      <div className="d-flex w-100 px-3">
        <LeftMenu
          models={models}
          activeModel={activeModel}
          setActiveModel={setActiveModel}
        />
        <DataView
          data={modelData}
          activeModel={activeModel}
          loading={loading}
          page={page}
          limit={limit}
          onChangeParams={onChangeParams}
        />
      </div>
    </div>
  );
};

export default memo(HomePage);
