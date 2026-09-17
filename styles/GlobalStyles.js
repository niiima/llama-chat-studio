// import react from "react";
import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`

#root {
    --main-color:rgb(0,127,212);
    --main-active-color:#39f;
    --active-color:rgb(50,139,248);
    --active-primary-color:#f6d365;
    --active-secondary-color:#f6d365;
}

:root {
    color-scheme: light dark;
}


html,
body,
#root {
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 0;
}

body{
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Chivo Mono', sans-serif;
  justify-content: center;
  align-items: center;
  background: gray; 
  }

*,
*:after,
*:before {
  box-sizing: border-box;
  font-family: 'Chivo Mono', sans-serif;
}

.flex.fill {
  height: 100%;
}

.flex.center {
  justify-content: center;
}

.cs-main-container,
.cs-chat-container {
  background: transparent !important;
  border: none !important;
}

.cs-message-list {
  background: transparent !important;
}

.cs-message__custom-content > * {
  margin-top: 2px;
  margin-bottom: 2px;
}

.scroll-customized::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    background: linear-gradient(320deg, #11e7df 0%, #39f 50%, #b490ca 100%);
  }

  .scroll-customized::-webkit-scrollbar {
    width: 10px;
    background-color: #f5f5f5;
  }

  .scroll-customized::-webkit-scrollbar-thumb {
    background-color: #0ae;

    background-image: -webkit-gradient(
      linear,
      0 0,
      0 100%,
      color-stop(0.5, rgba(255, 255, 255, 0.2)),
      color-stop(0.5, transparent),
      to(transparent)
    );
  }

  .error-message{
    color:orange;
    font-weight: 700;
    padding-left:5px;
  }
`;

export default GlobalStyles;
