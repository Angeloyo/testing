const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors()); // Esto permite solicitudes de cualquier origen. Ajusta según sea necesario.

app.use(express.json());

const fs = require('fs');
const path = './containerId.txt';
let containerId = ''; // Variable para almacenar el ID del contenedor


app.post('/encender-canal', (req, res) => {
  exec('docker run -d -p 8050:80 ghcr.io/martinbjeldbak/acestream-http-proxy', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send({ message: 'Error al encender el canal' });
    }
    containerId = stdout.trim();
    fs.writeFileSync(path, containerId); // Escribe el ID del contenedor a un archivo
    res.send({ message: 'Canal encendido con éxito', containerId });
  });
});

app.post('/encender-canalT', (req, res) => {
  exec('docker compose up -d', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send({ message: 'Error al encender el canal' });
    }
    fs.writeFileSync(path, containerId); // Escribe el ID del contenedor a un archivo
    res.send({ message: 'Canal transcoding encendido con éxito'});
  });
});

app.post('/apagar-canal', (req, res) => {
    if (!containerId) {
      return res.status(400).send({ message: 'No hay un canal para apagar' });
    }
    exec(`docker stop ${containerId}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send({ message: 'Error al apagar el canal' });
      }
      res.send({ message: 'Canal apagado con éxito' });
      containerId = ''; // Limpia el ID del contenedor después de detenerlo
    });
});
  
app.get('/estado-canal', (req, res) => {
  if (!fs.existsSync(path)) {
    return res.send({ estado: 'Canal apagado' });
  }
  
  // Lee el ID del contenedor desde un archivo si no está en memoria
  if (!containerId) {
    containerId = fs.readFileSync(path, 'utf8');
  }

  exec('docker ps -q --no-trunc', (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).send({ estado: 'Error al verificar el estado del canal' });
    }
    // Divide stdout por nuevas líneas para obtener un array de IDs
    const containersRunning = stdout.split('\n').filter(Boolean);
    const estaCorriendo = containersRunning.includes(containerId);
    res.send({ estado: estaCorriendo ? `Canal encendido. ID del contenedor: ${containerId}` : 'Canal apagado' });
  });
});

  

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
