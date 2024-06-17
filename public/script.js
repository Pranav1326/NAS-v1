document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('uploadForm');
  const folderUploadForm = document.getElementById('folderUploadForm');
  const createFolderForm = document.getElementById('createFolderForm');
  const fileInput = document.getElementById('fileInput');
  const folderInput = document.getElementById('folderInput');
  const folderNameInput = document.getElementById('folderNameInput');
  const fileList = document.getElementById('fileList');
  const backButton = document.getElementById('backButton');
  const breadcrumb = document.getElementById('breadcrumb');

  let currentPath = '/';

  uploadForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('path', currentPath);
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
    formData.append('path', currentPath);
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

  createFolderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const folderName = folderNameInput.value.trim();
    if (folderName) {
      fetch('/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ path: currentPath, folderName: folderName })
      })
      .then(response => response.text())
      .then(data => {
        alert(data);
        loadFiles();
      })
      .catch(error => console.error('Error:', error));
    }
  });

  backButton.addEventListener('click', () => {
    const pathParts = currentPath.split('/').filter(Boolean);
    pathParts.pop();
    currentPath = pathParts.join('/');
    loadFiles();
  });

  function loadFiles() {
    fetch(`/files?path=${encodeURIComponent(currentPath)}`)
      .then(response => response.json())
      .then(files => {
        fileList.innerHTML = '';
        files.forEach(file => {
          const listItem = document.createElement('li');

          const fileNameSpan = document.createElement('span');
          fileNameSpan.textContent = file.name;

          if (file.type === 'directory') {
            fileNameSpan.style.cursor = 'pointer';
            fileNameSpan.onclick = () => {
              currentPath = file.path;
              loadFiles();
            };

            const folderIcon = document.createElement('img');
            folderIcon.src = 'folder-icon.png'; // Add a folder icon image in your public directory
            folderIcon.alt = 'Folder';
            folderIcon.style.width = '20px';
            folderIcon.style.height = '20px';

            listItem.appendChild(folderIcon);
          } else {
            fileNameSpan.style.cursor = 'pointer';
            fileNameSpan.onclick = () => viewFile(file.path);

            const fileIcon = document.createElement('img');
            fileIcon.src = 'file-icon.png'; // Add a generic file icon image in your public directory
            fileIcon.alt = 'File';
            fileIcon.style.width = '20px';
            fileIcon.style.height = '20px';

            listItem.appendChild(fileIcon);
          }

          const deleteButton = document.createElement('button');
          deleteButton.textContent = 'Delete';
          deleteButton.onclick = () => deleteFile(file.path);

          const renameButton = document.createElement('button');
          renameButton.textContent = 'Rename';
          renameButton.onclick = () => renameFile(file.path);

          listItem.appendChild(fileNameSpan);
          listItem.appendChild(deleteButton);
          listItem.appendChild(renameButton);
          fileList.appendChild(listItem);
        });

        backButton.style.display = currentPath ? 'block' : 'none';
        updateBreadcrumb();
      })
      .catch(error => console.error('Error:', error));
  }

  function updateBreadcrumb() {
    breadcrumb.innerHTML = '';

    const pathParts = currentPath.split('/').filter(Boolean);
    let fullPath = '';

    pathParts.forEach((part, index) => {
      fullPath += part + '/';

      const span = document.createElement('span');
      span.textContent = part;
      span.style.cursor = 'pointer';
      span.onclick = () => {
        currentPath = pathParts.slice(0, index + 1).join('/');
        loadFiles();
      };

      breadcrumb.appendChild(span);
      if (index < pathParts.length - 1) {
        breadcrumb.appendChild(document.createTextNode(' / '));
      }
    });

    if (currentPath) {
      const rootSpan = document.createElement('span');
      rootSpan.textContent = 'Root';
      rootSpan.style.cursor = 'pointer';
      rootSpan.onclick = () => {
        currentPath = '';
        loadFiles();
      };

      breadcrumb.insertBefore(document.createTextNode(' / '), breadcrumb.firstChild);
      breadcrumb.insertBefore(rootSpan, breadcrumb.firstChild);
    }
  }

  function deleteFile(filePath) {
    fetch(`/files/${encodeURIComponent(filePath)}`, {
      method: 'DELETE'
    })
    .then(response => response.text())
    .then(data => {
      alert(data);
      loadFiles();
    })
    .catch(error => console.error('Error:', error));
  }

  function renameFile(filePath) {
    const newFilename = prompt('Enter new name:');
    if (newFilename) {
      fetch(`/files/${encodeURIComponent(filePath)}`, {
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

  function viewFile(filePath) {
    const fileExt = filePath.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(fileExt)) {
      const img = document.createElement('img');
      img.src = `/files/${encodeURIComponent(filePath)}`;
      img.style.maxWidth = '500px';
      img.style.maxHeight = '500px';

      const viewer = document.createElement('div');
      viewer.style.position = 'fixed';
      viewer.style.top = '50%';
      viewer.style.left = '50%';
      viewer.style.transform = 'translate(-50%, -50%)';
      viewer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      viewer.style.padding = '10px';
      viewer.style.borderRadius = '5px';
      viewer.style.zIndex = '1000';
      viewer.style.textAlign = 'center';

      viewer.appendChild(img);

      const closeButton = document.createElement('button');
      closeButton.style.position = 'absolute';
      closeButton.style.top = '1rem';
      closeButton.style.right = '1rem';
      closeButton.textContent = 'X';
      closeButton.onclick = () => {
        document.body.removeChild(viewer);
      };

      const downloadButton = document.createElement('button');
      downloadButton.style.position = 'absolute';
      downloadButton.style.top = '3rem';
      downloadButton.style.right = '1rem';
      downloadButton.textContent = 'Download';
      downloadButton.onclick = () => {
        const link = document.createElement('a');
        link.href = `/files/download/${encodeURIComponent(filePath)}`;
        link.download = filePath.split('/').pop();
        link.click();
      };

      viewer.appendChild(downloadButton);
      viewer.appendChild(closeButton);
      document.body.appendChild(viewer);
    } else {
      alert('This file is not viewable.');
    }
  }

  loadFiles();
});
