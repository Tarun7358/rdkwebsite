const fs = require('fs');
let html = fs.readFileSync('frontend/src/extracted_body.html', 'utf8');

// Strip out script tags and their contents
html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

// Convert class to className
html = html.replace(/class=/g, 'className=');

// Convert for to htmlFor
html = html.replace(/for=/g, 'htmlFor=');

// Close unclosed tags robustly
html = html.replace(/<(img|input|br|hr)([^>]*?)\/?>/gi, '<$1$2 />');

// Convert SVG properties
html = html.replace(/stroke-width=/g, 'strokeWidth=');
html = html.replace(/stroke-linecap=/g, 'strokeLinecap=');
html = html.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
html = html.replace(/clip-rule=/g, 'clipRule=');
html = html.replace(/fill-rule=/g, 'fillRule=');

// Strip out style tags within the body or just remove style attributes for simplicity since React style syntax is different
html = html.replace(/style="[^"]*"/g, '');

// Some SVGs use xml:space which React doesn't like
html = html.replace(/xml:space="preserve"/g, '');
html = html.replace(/xmlns:xlink="[^"]*"/g, '');

// Remove HTML comments
html = html.replace(/<!--[\s\S]*?-->/g, '');

// Escape JSX curly braces in the text
html = html.replace(/\{/g, '&#123;');
html = html.replace(/\}/g, '&#125;');

const component = `
import React from 'react';
import '../index.css';

const Home = () => {
  return (
    <>
      ${html}
    </>
  );
};

export default Home;
`;

fs.writeFileSync('frontend/src/pages/Home.tsx', component);
