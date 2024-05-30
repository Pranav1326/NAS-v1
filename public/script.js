document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const folderUploadForm = document.getElementById('folderUploadForm');
  const fileInput = document.getElementById('fileInput');
  const folderInput = document.getElementById('folderInput');
  const fileList = document.getElementById('fileList');

  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const file of fileInput.files) {
      formData.append('files', file, file.name);
    }

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      alert(data);
      loadFiles();
    })
    .catch(error => console.error('Error:', error));
  });

  folderUploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (const file of folderInput.files) {
      formData.append('files', file, file.webkitRelativePath);
    }

    fetch('/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.text())
    .then(data => {
      alert(data);
      loadFiles();
    })
    .catch(error => console.error('Error:', error));
  });

  function loadFiles() {
    fetch('/files')
      .then(response => response.json())
      .then(files => {
        fileList.innerHTML = '';
        files.forEach(file => {
          const listItem = document.createElement('li');

          const fileNameSpan = document.createElement('span');
          fileNameSpan.textContent = file;

          const previewImage = document.createElement('img');
          previewImage.src = file.match(/\.(jpeg|jpg|gif|png)$/) ? `/files/${file}` : 'placeholder.png';
          previewImage.classList.add('preview');
          previewImage.alt = file;

          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.onclick = () => deleteFile(file);

          const renameButton = document.createElement('button');
          renameButton.textContent = 'Rename';
          renameButton.onclick = () => renameFile(file);

          listItem.appendChild(previewImage);
          listItem.appendChild(fileNameSpan);
          listItem.appendChild(deleteButton);
          listItem.appendChild(renameButton);
          fileList.appendChild(listItem);
        });
      });
  }

  function deleteFile(filename) {
    fetch(`/files/${filename}`, {
      method: 'DELETE'
    })
    .then(response => response.text())
    .then(data => {
      alert(data);
      loadFiles();
    })
    .catch(error => console.error('Error:', error));
  }

  function renameFile(filename) {
    const newFilename = prompt('Enter new filename:', filename);
    if (newFilename) {
      fetch(`/files/${filename}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ newFilename: newFilename })
      })
      .then(response => response.text())
      .then(data => {
        alert(data);
        loadFiles();
      })
      .catch(error => console.error('Error:', error));
    }
  }

  loadFiles();
});
