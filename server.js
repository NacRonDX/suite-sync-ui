const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

let distPath;
const possiblePaths = [
  path.join(__dirname, 'dist/suite-sync-ui/browser'),
  path.join(__dirname, 'dist/suite-sync-ui'),
  path.join(__dirname, 'dist/browser'),
  path.join(__dirname, 'dist'),
];

for (const p of possiblePaths) {
  if (fs.existsSync(path.join(p, 'index.html'))) {
    distPath = p;
    console.log(`Found dist path: ${distPath}`);
    break;
  }
}

if (!distPath) {
  console.error('Could not find dist folder with index.html');
  process.exit(1);
}

app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`Serving files from: ${distPath}`);
});
