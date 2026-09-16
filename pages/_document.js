import { Html, Head, Main, NextScript } from "next/document";
// import { Inter } from "@next/font/google";

// const inter = Inter({ subsets: ["latin"] });
export default function Document() {
  return (
    <Html>
      <Head>
        {/* <title>AI Enabled Assistant</title> */}
        <meta name='color-scheme' content='dark light'></meta>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link
          rel='preconnect'
          href='https://fonts.gstatic.com'
          crossOrigin='true'
        />
        <link
          href='https://fonts.googleapis.com/css2?family=Chivo+Mono:wght@200&display=swap'
          rel='stylesheet'
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
