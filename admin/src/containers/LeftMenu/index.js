import React from 'react';
import PropTypes from 'prop-types';
import Wrapper from './Wrapper';
import LeftMenuItem from '../../Components/LeftMenuItem';

const LeftMenu = ({ models, activeModel, setActiveModel }) => {
  return (
    <Wrapper>
      <h4 className="p-3">Models</h4>
      <hr />
      {models && models.length
        ? models.map((model) => (
            <LeftMenuItem
              label={model.index}
              onClick={() => setActiveModel(model)}
              active={model.index === activeModel?.index}
              enable={model.enable}
            />
          ))
        : null}
    </Wrapper>
  );
};

LeftMenu.propTypes = {
  models: PropTypes.array.isRequired,
  activeModel: PropTypes.object.isRequired,
  setActiveModel: PropTypes.func.isRequired,
};

export default LeftMenu;
