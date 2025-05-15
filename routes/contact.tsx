import Layout from "../components/Layout.tsx";

export default function ContactPage() {
  return (
    <Layout>
      <section>
        <h2>Contact Me</h2>
        <p>
          You can reach me via email or connect with me on my professional profiles:
        </p>
        <ul>
          <li><strong>Email:</strong> <a href="mailto:[your.email@example.com]">[your.email@example.com]</a></li>
          <li><strong>GitHub:</strong> <a href="https://github.com/[yourusername]" target="_blank" rel="noopener noreferrer">github.com/[yourusername]</a></li>
          <li><strong>LinkedIn:</strong> <a href="https://linkedin.com/in/[yourprofile]" target="_blank" rel="noopener noreferrer">linkedin.com/in/[yourprofile]</a></li>
          {/* Add other relevant links as needed */}
        </ul>
        <p>
          I'm always open to discussing new projects, creative ideas, or opportunities to be part of something amazing.
        </p>
      </section>
    </Layout>
  );
} 