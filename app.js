const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
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

if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir);
}
// Create/Upload Files
// File Upload
app.post('/upload', (req, res) => {
  const form = new formidable.IncomingForm({ multiples: true });
  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).send('Error parsing form data');
    }

    const currentPath = fields.path.join() || '/';
    if (typeof currentPath !== 'string') {
      return res.status(400).send('Invalid path');
    }

    const uploadDir = path.join(storageDir, currentPath);

    const fileArray = Array.isArray(files.files) ? files.files : [files.files];

    fileArray.forEach(file => {
      const uploadPath = path.join(uploadDir, file.originalFilename);
      const dir = path.dirname(uploadPath);

      fs.mkdirSync(dir, { recursive: true });

      fs.rename(file.filepath, uploadPath, (err) => {
        if (err) {
          console.log(err)
          return res.status(500).send('Error uploading file');
        }
      });
    });

    res.send('Files uploaded successfully');
  });
});

// Create Folder
app.post('/create-folder', (req, res) => {
  const folderPath = path.join(storageDir, req.body.path || '', req.body.folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    res.send('Folder created successfully');
  } else {
    res.status(400).send('Folder already exists');
  }
});

// Read/Get File
app.get('/files/:filename', (req, res) => {
  const filePath = path.join(storageDir, req.params.filename);
  res.download(filePath);
});

// List Files
app.get('/files', (req, res) => {
  const currentPath = req.query.path || '';

  const listFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const filePath = path.resolve(dir, file);
      const stat = fs.statSync(filePath);
      if (stat && stat.isDirectory()) {
        results.push({ name: file, type: 'directory', path: path.join(currentPath, file) });
      } else {
        results.push({ name: file, type: 'file', path: path.join(currentPath, file) });
      }
    });
    return results;
  };

  const fullPath = path.join(storageDir, currentPath);
  if (fs.existsSync(fullPath)) {
    res.json(listFiles(fullPath));
  } else {
    res.status(404).send('Path not found');
  }
});

// Update/Rename File
app.put('/files/:path', (req, res) => {
  const oldPath = path.join(storageDir, req.params.path);
  const newPath = path.join(storageDir, path.dirname(req.params.path), req.body.newFilename);

  fs.rename(oldPath, newPath, (err) => {
    if (err) {
      return res.status(500).send('Error renaming file');
    }

    res.send('File renamed successfully');
  });
});

// Delete File
app.delete('/files/:path', (req, res) => {
  const filePath = path.join(storageDir, req.params.path);

  fs.rm(filePath, { recursive: true, force: true }, (err) => {
    if (err) {
      return res.status(500).send('Error deleting file');
    }

    res.send('File deleted successfully');
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
