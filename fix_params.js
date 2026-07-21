const fs = require('fs');

const files = [
  'C:\\scrubbed\\src\\app\\channel\\[channelId]\\page.tsx',
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
    // Revert syntax error injected by previous script
    content = content.replace(/const params = await props.params;\s*/g, '');
    
    // Fix params type correctly
    // Match something like:
    // export default async function Foo(props: { params: Promise<{ username: string }> }) {
    // Or if it's still { params }: { params: { ... } }
    
    // Convert: ({ params }: { params: { username: string } }) => (props: { params: Promise<{ username: string }> })
    content = content.replace(/\(\s*\{\s*params\s*\}\s*:\s*\{\s*params\s*:\s*\{([^}]+)\}\s*\}\s*\)/g, '(props: { params: Promise<{$1}> })');
    
    // Convert: (props: { params: { username: string } }) => (props: { params: Promise<{ username: string }> })
    content = content.replace(/\(props\s*:\s*\{\s*params\s*:\s*\{([^}]+)\}\s*\}\s*\)/g, '(props: { params: Promise<{$1}> })');
    
    // Insert `const params = await props.params` right after the opening brace of the export function
    content = content.replace(/(export default async function[^{]+\{)/g, '$1\n  const params = await props.params;');
    
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  } catch (e) {
    console.log('Error on', f, e.message);
  }
});
