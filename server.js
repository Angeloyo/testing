const express = require('express');
const { exec } = require('child_process');
const app = express();
const port = 3000;

let containerId = ''; // Variable para almacenar el ID del contenedor

app.use(express.json());

// Ruta para encender el canal (ya existente)
app.post('/encender-canal', (req, res) => {
  exec('sudo docker run -d -p 8081:80 ghcr.io/martinbjeldbak/acestream-http-proxy', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send({ message: 'Error al encender el canal' });
    }
    containerId = stdout.trim(); // Almacena el ID del contenedor
    res.send({ message: 'Canal encendido con éxito', containerId: stdout.trim() });
  });
});

// Nueva ruta para apagar el canal
app.post('/apagar-canal', (req, res) => {
  if (!containerId) {
    return res.status(400).send({ message: 'No hay un canal para apagar' });
  }
  exec(`sudo docker stop ${containerId}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send({ message: 'Error al apagar el canal' });
    }
    res.send({ message: 'Canal apagado con éxito' });
    containerId = ''; // Limpia el ID del contenedor después de detenerlo
  });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
