const pkg = require('../package.json');

const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const app = express();

// Method to validate user CLI input
const isInteger= (str) => {

    if (typeof str !== 'string') {
        return false // we only process strings!  
    }

    return !isNaN(str) && !isNaN(parseFloat(str)) && Number.isInteger(parseFloat(str));

}

// Method to get all file paths in a directory
const getAllFilePaths = async (dir, files = []) => {

    const dirFindings = await fs.readdir(dir, { withFileTypes: true });

    for (const finding of dirFindings) {

        const findingFullPath = path.join(dir, finding.name);

        if (finding.isDirectory()) {
            await getAllFilePaths(findingFullPath, files);
        } else {
            files.push(findingFullPath);
        }

    }

    return files;

}

const PORT = isInteger(process.argv[2]) ? process.argv[2] : process.env.PORT || 3000;
const PUBLIC_DIR = path.join(process.pkg ? process.cwd() : __dirname, '../public');

// List available APIS
app.get('/api', async (req, res) => {

    const apis = await getAllFilePaths(PUBLIC_DIR);

    res.json(apis.map((file) => file.replace(PUBLIC_DIR, `http://localhost:${PORT}/api`).replace(/\\/g, '/')));

})

// Define a route handler for the default home page
app.get('/', (req, res) => {
    res.send(`JS-Mock server v${pkg.version}`);
});

// Serve static files from the "public" directory
app.use('/api/**', express.static(PUBLIC_DIR));

// Start the server
app.listen(PORT, () => {
    console.log(`JS-Mock server running on http://localhost:${PORT}`);
});