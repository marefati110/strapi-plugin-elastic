import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  td {
    max-width: 300px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
export default GlobalStyle;
