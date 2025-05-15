export default function Header() {
  return (
    <header>
      <div class="header-content">
        <div class="header-identity">
          <h1>Your Name</h1>
          <div class="header-sub-links">
            <a
              href="https://linkedin.com/in/yourprofile"
              target="_blank"
              rel="noopener noreferrer"
            >
              Linkedin
            </a>
            <span>|</span>
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
            >
              Github
            </a>
            <span>|</span>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer">
              Resume
            </a>
          </div>
        </div>
        <nav>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/blog">Blog</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
