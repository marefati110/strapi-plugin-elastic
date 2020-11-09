import React from 'react';
import PropTypes from 'prop-types';
import Wrapper from './Wrapper';

const LeftMenu = ({ label, onClick, active, enable }) => {
  return (
    <Wrapper
      onClick={() => {
        if (enable) onClick();
      }}
      active={active}
      enable={enable}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        data-prefix="fas"
        data-icon="circle"
        class="svg-inline--fa fa-circle fa-w-16 sc-fznBMq cEKNOz"
        role="img"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 512 512"
      >
        <path
          fill="currentColor"
          d="M256 8C119 8 8 119 8 256s111 248 248 248 248-111 248-248S393 8 256 8z"
        ></path>
      </svg>

      <span>{label}</span>
    </Wrapper>
  );
};

LeftMenu.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
  active: PropTypes.bool.isRequired,
};

export default LeftMenu;
