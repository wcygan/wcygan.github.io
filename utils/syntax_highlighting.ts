// This file imports PrismJS language components to enable syntax highlighting
// for various languages in Markdown code blocks.

// IMPORT CORE FIRST!
import "https://esm.sh/prismjs@1.29.0/components/prism-core.js";

// Minimal set of languages for testing
import "https://esm.sh/prismjs@1.29.0/components/prism-markup.js"; // spesso una dipendenza per altri linguaggi HTML, XML, SVG, MathML
import "https://esm.sh/prismjs@1.29.0/components/prism-css.js";
import "https://esm.sh/prismjs@1.29.0/components/prism-javascript.js";
import "https://esm.sh/prismjs@1.29.0/components/prism-rust.js"; // Per il tuo blocco di codice di test

// Note: Some GFM implementations might auto-load some of these.
// Explicit imports ensure they are available.
// Using esm.sh for direct component access.
