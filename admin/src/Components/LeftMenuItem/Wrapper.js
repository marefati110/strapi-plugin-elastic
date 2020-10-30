import styled from 'styled-components';

const Wrapper = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 100%;

  svg {
    color: rgb(145, 155, 174);
    width: 5px;
    height: 5px;
  }
`;

export default Wrapper;
