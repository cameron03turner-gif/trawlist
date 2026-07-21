const fs = require('fs');

const files = [
  'C:\\scrubbed\\src\\app\\u\\[username]\\diary\\page.tsx',
  'C:\\scrubbed\\src\\app\\u\\[username]\\followers\\page.tsx',
  'C:\\scrubbed\\src\\app\\u\\[username]\\following\\page.tsx',
  'C:\\scrubbed\\src\\app\\u\\[username]\\lists\\page.tsx',
  'C:\\scrubbed\\src\\app\\u\\[username]\\log\\page.tsx',
  'C:\\scrubbed\\src\\app\\u\\[username]\\stats\\page.tsx',
  'C:\\scrubbed\\src\\app\\u\\[username]\\watchlist\\page.tsx',
  'C:\\scrubbed\\src\\app\\u\\[username]\\page.tsx'
];

files.forEach(f => {
  try {
    let content = fs.readFileSync(f, 'utf8');
    
    // Remove lines that just contain `params: Promise<{ username: string }> }) {`
    const lines = content.split('\n');
    const newLines = lines.filter(line => !line.match(/^\s*params:\s*Promise<\{\s*username:\s*string\s*\}>\s*\}\)\s*\{\s*$/));
    fs.writeFileSync(f, newLines.join('\n'));
    console.log('Fixed', f);
  } catch (e) {
    console.log('Error on', f, e.message);
  }
});
