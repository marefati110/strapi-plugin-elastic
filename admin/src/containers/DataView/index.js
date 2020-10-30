import React, { memo, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Table } from '@buffetjs/core';
import Wrapper from './Wrapper';
import { isObject } from 'lodash';

const DataView = ({ data = [] }) => {
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
            console.log('data', dataObject);
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
  console.log('tableRow ', tableData);

  return (
    <Wrapper className="col-md-7 col-sm-12">
      <Table headers={tableHeaders} rows={tableData} />
    </Wrapper>
  );
};

DataView.propTypes = {
  data: PropTypes.array.isRequired,
};

export default memo(DataView);
