import { ComponentChildren } from "preact";
import Header from "./Header.tsx";
import Footer from "./Footer.tsx";

interface LayoutProps {
  children: ComponentChildren;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <head>
        <title>[Your Name] - Personal Website</title>
        <link rel="stylesheet" href="/styles.css" />
      </head>
      <body>
        <Header />
        <main class="container">
          {children}
        </main>
        <Footer />
      </body>
    </>
  );
} 