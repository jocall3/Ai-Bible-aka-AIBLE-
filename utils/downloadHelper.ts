import type { Book } from '../types';

function generateHtmlContent(book: Book): string {
  const styles = `
    <style>
      body {
        font-family: 'Inter', sans-serif;
        line-height: 1.7;
        color: #cbd5e1; /* slate-300 */
        background-color: #111827; /* gray-900 */
        max-width: 800px;
        margin: 0 auto;
        padding: 40px;
      }
      h1, h2, h3, h4 {
        font-family: 'Share Tech Mono', monospace;
      }
      h1 { 
        font-size: 2.8em; 
        text-align: center; 
        color: #fcd34d; /* amber-300 */
        border: none; 
        margin-bottom: 1em;
      }
      h2 { 
        font-size: 2em; 
        margin-top: 2em; 
        color: #f59e0b; /* amber-500 */
        border-bottom: 1px solid #d9770680;
        padding-bottom: 8px;
      }
      h3 { 
        font-size: 1.5em; 
        margin-top: 1.5em; 
        color: #fbbf24; /* amber-400 */
        border-bottom: 1px solid #f59e0b40;
        padding-bottom: 6px;
      }
      h4 { 
        font-size: 1.2em; 
        color: #fcd34d; /* amber-300 */
        margin-top: 1.5em;
        margin-bottom: 0.5em;
      }
      p {
        margin-bottom: 1em;
      }
      .toc { list-style: none; padding-left: 0; }
      .toc a { color: #fbbf24; text-decoration: none; }
      .toc a:hover { text-decoration: underline; color: #fcd34d; }
      .toc-section { font-weight: bold; font-size: 1.2em; margin-top: 1em; }
      .toc-chapter { padding-left: 2em; }
      p em {
          color: #64748b; /* slate-500 */
      }
    </style>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Inter:wght@400;600&display=swap" rel="stylesheet">
  `;

  let bodyContent = '<h1>The Aletheia Engine: A Codex of Being</h1>';
  
  // Table of Contents
  bodyContent += '<h2>Codex Table of Contents</h2><ul class="toc">';
  book.forEach((section, sIdx) => {
    bodyContent += `<li class="toc-section"><a href="#section-${sIdx}">${sIdx + 1}. ${section.title}</a></li>`;
    section.chapters.forEach((chapter, cIdx) => {
      bodyContent += `<li class="toc-chapter"><a href="#chapter-${sIdx}-${cIdx}">${sIdx + 1}.${cIdx + 1}. ${chapter.title}</a></li>`;
    });
  });
  bodyContent += '</ul>';

  // Full Content
  book.forEach((section, sIdx) => {
    bodyContent += `<h2 id="section-${sIdx}">${sIdx + 1}. ${section.title}</h2>`;
    section.chapters.forEach((chapter, cIdx) => {
      bodyContent += `<h3 id="chapter-${sIdx}-${cIdx}">Chapter ${sIdx + 1}.${cIdx + 1}: ${chapter.title}</h3>`;
      if (chapter.pages.length === 0) {
        bodyContent += '<p><em>[No fragments in this chapter.]</em></p>';
      }
      chapter.pages.forEach((page, pIdx) => {
        bodyContent += `<h4>Fragment ${sIdx + 1}.${cIdx + 1}.${pIdx + 1}: ${page.title}</h4>`;
        if (!page.content) {
          bodyContent += '<p><em>[This fragment is unsynthesized.]</em></p>';
        } else {
          const paragraphs = page.content.split('\n').filter(p => p.trim() !== '');
          paragraphs.forEach(p => {
            bodyContent += `<p>${p}</p>`;
          });
        }
      });
    });
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>The Aletheia Engine: A Codex of Being</title>
        ${styles}
      </head>
      <body>
        ${bodyContent}
      </body>
    </html>
  `;
}

export function downloadBookAsHtml(book: Book) {
  const htmlString = generateHtmlContent(book);
  const blob = new Blob([htmlString], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Aletheia_Engine_Codex.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}