const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

app.get('/data', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airdrops.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json([]);
    res.json(JSON.parse(data));
  });
});

app.post('/save', (req, res) => {
  const filePath = path.join(__dirname, 'data', 'airdrops.json');
  const newEntry = req.body;

  fs.readFile(filePath, 'utf8', (err, data) => {
    const arr = err ? [] : JSON.parse(data);
    arr.push(newEntry);
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), () => {
      res.json({ message: 'Disimpan' });
    });
  });
});

app.post('/delete', (req, res) => {
  const { index } = req.body;
  const filePath = path.join(__dirname, 'data', 'airdrops.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    const arr = JSON.parse(data);
    arr.splice(index, 1);
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), () => {
      res.json({ message: 'Dihapus' });
    });
  });
});

app.post('/edit', (req, res) => {
  const { index, entry } = req.body;
  const filePath = path.join(__dirname, 'data', 'airdrops.json');

  fs.readFile(filePath, 'utf8', (err, data) => {
    const arr = JSON.parse(data);
    arr[index] = entry;
    fs.writeFile(filePath, JSON.stringify(arr, null, 2), () => {
      res.json({ message: 'Diupdate' });
    });
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});
