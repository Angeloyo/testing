const express = require('express');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

app.post('/encender', (req, res) => {
  // Ejecutar el comando Docker
  exec('sudo docker run -d -p 8081:80 ghcr.io/martinbjeldbak/acestream-http-proxy', (err, stdout, stderr) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error al ejecutar el contenedor Docker');
    }
    console.log(stdout);
    console.error(stderr);
    res.send('Contenedor Docker iniciado correctamente');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
