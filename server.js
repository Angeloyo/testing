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
  exec('STREAM_ID=f096a64dd756a6d549aa7b12ee9acf7eee27e833 docker compose -p c1 up -d', (error, stdout, stderr) => {
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

app.post('/apagar-canalT', (req, res) => {
    // Ejecuta los comandos de docker-compose y luego elimina los archivos en ./data
    // Se utiliza exec para permitir la ejecución de múltiples comandos separados por &&
    exec(`docker compose -p c1 kill && docker compose -p c1 rm && rm -rf ./data/*`, (error, stdout, stderr) => {
        // Verifica si hubo un error durante la ejecución
        if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`); // Muestra la salida de error estándar para diagnóstico
            // Envía una respuesta detallada en caso de error, incluyendo el mensaje de error y la salida stderr
            return res.status(500).send({
                message: 'Error al apagar el canal',
                error: error.toString(),
                stderr: stderr
            });
        }
        // Si no hay error, registra la salida estándar para auditoría o diagnóstico
        console.log(`stdout: ${stdout}`);
        // Envía una respuesta de éxito, considera incluir parte de stdout si es relevante para el cliente
        res.send({
            message: 'Canal transcoding apagado con éxito',
            stdout: stdout // Opcional, dependiendo de si quieres exponer esta información
        });
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
    res.send({ estado: estaCorriendo ? `Estado canal : encendido. ID del contenedor: ${containerId}` : 'Estado canal : apagado' });
  });
});

app.get('/estado-canalT', (req, res) => {

    // Lee el ID del contenedor desde un archivo si no está en memoria
    if (!containerId) {
      containerId = fs.readFileSync(path, 'utf8');
    }
  
    exec('docker compose -p c1 ps', (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res.status(500).send({ estado: 'Error al verificar el estado del canal' });
      }
    //   const containersRunning = stdout.split('\n').filter(Boolean);
      const estaCorriendo = stdout.includes('c1');
      res.send({ estado: estaCorriendo ? `estado canal transcoding : encendido.` : 'estado canal transcoding : apagado' });
    });
  });
  

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});
