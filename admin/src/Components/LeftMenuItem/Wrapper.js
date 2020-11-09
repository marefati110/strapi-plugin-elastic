import styled from 'styled-components';

const Wrapper = styled.div`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  display: flex;
  align-items: center;
  width: 100%;
  height: 35px;
  padding-left: 15px;
  background-color: ${({ active }) => (active ? '#e9eaeb' : 'transparent')};
  opacity: ${({ enable }) => (enable ? '1' : '0.4')};

  svg {
    color: rgb(145, 155, 174);
    width: 5px;
    height: 5px;
  }
`;

export default Wrapper;
