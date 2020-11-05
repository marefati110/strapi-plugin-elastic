import styled from 'styled-components';

import { colors, sizes } from 'strapi-helper-plugin';

const Wrapper = styled.div`
  width: 20%;
  height: calc(100vh - ${sizes.header.height});
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f2f3f4;
  margin-left: 15px;
  padding-top: 10px;
`;

export default Wrapper;
