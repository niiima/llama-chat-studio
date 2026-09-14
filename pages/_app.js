// import "../styles/styles.scss";
import React from "react";
import styles from "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import { ChatProvider } from "../context/ChatContext";
import { UIContextProvider } from "../context/UIContext";
import { AIProvider } from "../context/AIContext";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "styled-components";
import theme from "../styles/theme";
import GlobalStyles from "../styles/GlobalStyles";
// import { Analytics } from "@vercel/analytics/react";

export default function MyApp({ Component, pageProps }) {
  return (
    <React.StrictMode>
      {" "}
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
          <UIContextProvider>
            <ChatProvider>
              <AIProvider>
                <Component {...pageProps} />
                {/* <Analytics /> */}
              </AIProvider>
            </ChatProvider>
          </UIContextProvider>
        </AuthProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}
