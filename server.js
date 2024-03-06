const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors()); // Esto permite solicitudes de cualquier origen. Ajusta según sea necesario.

app.use(express.json());

app.post('/encender-canal', (req, res) => {
  exec('docker run -d -p 8081:80 ghcr.io/martinbjeldbak/acestream-http-proxy', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send({ message: 'Error al encender el canal' });
    }
    console.log(`stdout: ${stdout}`);
    console.error(`stderr: ${stderr}`);
    res.send({ message: 'Canal encendido con éxito', containerId: stdout.trim() });
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
