import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table } from '@buffetjs/core';
import { LoadingBar } from '@buffetjs/styles';
import { GlobalPagination } from 'strapi-helper-plugin';
import Wrapper from './Wrapper';
import { isObject } from 'lodash';

const DataView = ({
  data = [],
  activeModel = '',
  loading,
  page,
  limit,
  onChangeParams,
}) => {
  const tableHeaders = useMemo(
    () =>
      data && data.length
        ? Object.keys(data[0]).map((d) => ({ name: d, value: d }))
        : [],
    [data]
  );

  const tableData = useMemo(
    () =>
      data && data.length
        ? data.map((dataObject) => {
            let newObj = {};
            if (!dataObject) return newObj;

            for (let key in dataObject) {
              if (isObject(dataObject[key])) {
                newObj[key] = JSON.stringify(dataObject[key], null, 2);
              } else {
                newObj[key] = dataObject[key];
              }
            }

            return newObj;
          })
        : [],
    [data]
  );

  return (
    <Wrapper>
      <h2>{activeModel?.index?.toUpperCase()}</h2>
      {loading ? (
        <LoadingBar />
      ) : (
        <>
          <Table headers={tableHeaders} rows={tableData} />
          <div className="mt-5">
            <GlobalPagination
              count={10}
              onChangeParams={onChangeParams}
              params={{
                _limit: limit,
                _page: page,
              }}
            />
          </div>
        </>
      )}
    </Wrapper>
  );
};

DataView.propTypes = {
  data: PropTypes.array.isRequired,
  activeModel: PropTypes.string.isRequired,
  loading: PropTypes.bool.isRequired,
  page: PropTypes.number.isRequired,
  limit: PropTypes.number.isRequired,
  onChangeParams: PropTypes.func.isRequired,
};

export default memo(DataView);
