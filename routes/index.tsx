import { Head } from "$fresh/runtime.ts";

export default function Home() {
  return (
    <>
      <Head>
        <title>Will Cygan</title>
        <style>
          {`
            body { font-family: sans-serif; line-height: 1.6; margin: 0; background-color: #f4f4f4; color: #333; }
            .container { max-width: 800px; margin: 2rem auto; padding: 1rem; background-color: #fff; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
            header, footer { text-align: center; padding: 1rem 0; }
            header h1 { margin: 0; color: #333; }
            footer p { margin: 0; font-size: 0.9em; color: #555; }
            h2 { border-bottom: 1px solid #eee; padding-bottom: 0.5rem; margin-top: 2rem; }
            article { margin-bottom: 1.5rem; }
            article h3 { margin-bottom: 0.2rem; color: #0056b3; }
            article p { margin-top: 0; margin-bottom: 0.2rem; font-size: 0.9em; }
            .about-me img { display: block; margin: 1rem auto; border-radius: 50%; }
          `}
        </style>
      </Head>
      <div class="container">
        <header>
          <h1>Will Cygan</h1>
        </header>

        <main>
          <section id="latest-posts">
            <h2>Latest Posts</h2>
            <article>
              <h3>My First Blog Post Title</h3>
              <p>Date: October 26, 2023</p>
              <p>This is a short excerpt of my first blog post. It talks about interesting things...</p>
            </article>
            <article>
              <h3>Another Interesting Topic</h3>
              <p>Date: October 24, 2023</p>
              <p>Exploring another fascinating subject in the world of software development...</p>
            </article>
            {/* Add more post summaries here if needed, without links */}
          </section>

          <section id="about-me" class="about-me">
            <h2>About Me</h2>
            <img
              src="/profile.jpg" // Placeholder - ensure this image exists in /static or update path
              width="100"
              height="100"
              alt="Will Cygan"
            />
            <p style={{ textAlign: 'center' }}>
              Exploring ideas and building software.
            </p>
            {/* Links removed */}
          </section>
        </main>

        <footer>
          <p>&copy; {new Date().getFullYear()} Will Cygan. All rights reserved.</p>
        </footer>
      </div>
    </>
  );
}
