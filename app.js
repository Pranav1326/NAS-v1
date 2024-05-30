const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const storageDir = '/Users/pranav/storage';

// Serve static files from the public directory
app.use(express.static('public'));

// Middleware to parse JSON bodies
app.use(express.json());

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(storageDir, path.dirname(file.originalname || file.webkitRelativePath));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, path.basename(file.originalname || file.webkitRelativePath));
  }
});

const upload = multer({ storage: storage });

// CRUD Routes

// Create/Upload Files
app.post('/upload', upload.array('files'), (req, res) => {
  res.send('Files uploaded successfully');
});

// Read/Get File
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(storageDir, req.params.filename);
  res.download(filePath);
});

// List Files
app.get('/files', (req, res) => {
  const listFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      file = path.resolve(dir, file);
      const stat = fs.statSync(file);
      if (stat && stat.isDirectory()) {
        results = results.concat(listFiles(file));
      } else {
        results.push(file.replace(storageDir + path.sep, ''));
      }
    });
    return results;
  };
  res.json(listFiles(storageDir));
});

// Update/Rename File
app.put('/files/:filename', (req, res) => {
  const oldPath = path.join(storageDir, req.params.filename);
  const newPath = path.join(storageDir, req.body.newFilename);
  fs.rename(oldPath, newPath, (err) => {
    if (err) return res.status(500).send(err);
    res.send('File renamed successfully');
  });
});

// Delete File
app.delete('/files/:filename', (req, res) => {
  const filePath = path.join(storageDir, req.params.filename);
  fs.unlink(filePath, (err) => {
    if (err) return res.status(500).send(err);
    res.send('File deleted successfully');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
