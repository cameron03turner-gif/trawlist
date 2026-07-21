fetch('https://www.youtube.com/@mkbhd')
  .then(res => res.text())
  .then(html => {
    const match = html.match(/<meta property="og:image" content="([^"]+)"/);
    console.log(match ? match[1] : 'No match');
  });
