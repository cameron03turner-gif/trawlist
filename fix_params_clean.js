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
    
    // Clean up all occurrences of "const params = await props.params;"
    content = content.replace(/const params = await props\.params;?/g, '');
    
    // Replace whole signature
    if (f.includes('channelId')) {
      content = content.replace(/export default async function ChannelPage[^{]+\{/, 
        "export default async function ChannelPage(props: { params: Promise<{ channelId: string }> }) {\n  const params = await props.params");
    } else {
      const match = content.match(/export default async function ([A-Za-z]+)/);
      if (match) {
         const funcName = match[1];
         // careful not to match the body, just the signature up to the first {
         const regex = new RegExp(`export default async function ${funcName}[^{]+\\{`);
         content = content.replace(regex, 
           `export default async function ${funcName}(props: { params: Promise<{ username: string }> }) {\n  const params = await props.params`);
      }
    }
    
    fs.writeFileSync(f, content);
    console.log('Fixed', f);
  } catch (e) {
    console.log('Error on', f, e.message);
  }
});
