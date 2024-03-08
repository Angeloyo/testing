const express = require('express');
const { exec } = require('child_process');

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const app = express();
const port = 3000;

const cors = require('cors');
app.use(cors()); // Esto permite solicitudes de cualquier origen. Ajusta según sea necesario.

app.use(express.json());

function getNextAvailableId(callback) {
    db.all("SELECT live_channel_id FROM canales ORDER BY live_channel_id ASC", [], (err, rows) => {
        if (err) {
            console.error(`Error de base de datos: ${err.message}`);
            callback(err, null);
            return;
        }

        let nextAvailableId = 0; // Comienza buscando desde el ID 0
        for (let row of rows) {
            if (row.live_channel_id == nextAvailableId) {
                nextAvailableId++; // Si el ID actual está en uso, intenta con el siguiente
            } else {
                break; // Encuentra un hueco
            }
        }

        callback(null, nextAvailableId);
    });
}


// Encender canal raw (sin transcoding)
app.post('/api/canales/encender/raw/:id', (req, res) => {
    const { id } = req.params; // Obtiene el ID del canal desde el parámetro URL

    // Primero, verifica si el canal existe
    const checkQuery = `SELECT id FROM canales WHERE id = ?`;
    db.get(checkQuery, [id], (checkErr, row) => {
        if (checkErr) {
            console.error(`Error al verificar el canal: ${checkErr}`);
            return res.status(500).send({ message: 'Error al verificar el canal' });
        }

        if (!row) {
            // Si no se encuentra el canal, envía una respuesta indicando que no existe
            return res.status(404).send({ message: 'Canal no encontrado' });
        }

        // Si el canal existe, procede con la lógica para encenderlo
        getNextAvailableId((err, liveChannelId) => {
            if (err) {
                return res.status(500).send({ message: 'Error al obtener el próximo liveChannelId disponible' });
            }

            const port = 8050 + liveChannelId;

            exec(`docker run -d -p ${port}:80 ghcr.io/martinbjeldbak/acestream-http-proxy`, (error, stdout) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    console.log(liveChannelId);
                    return res.status(500).send({ message: 'Error al encender el canal'});
                }
                const containerId = stdout.trim();

                const updateQuery = `UPDATE canales SET docker_id = ?, live_channel_id = ? WHERE id = ?`;
                db.run(updateQuery, [containerId, liveChannelId, id], function(updateErr) {
                    if (updateErr) {
                        console.error(updateErr.message);
                        return res.status(500).send({ message: 'Error al actualizar la información del canal' });
                    }
                    res.send({ message: 'Canal encendido con éxito', id, liveChannelId, port, containerId });
                });
            });
        });
    });
});

app.delete('/api/canales/apagar/raw/:id', (req, res) => {
    const { id } = req.params; // Obtiene el ID del canal desde el parámetro URL

    // Primero, obtiene el docker_id del canal a apagar.
    const getDockerIdQuery = `SELECT docker_id FROM canales WHERE id = ?`;
    db.get(getDockerIdQuery, [id], (getErr, row) => {

        if (getErr) {
            console.error(`Error al obtener el docker_id del canal: ${getErr}`);
            return res.status(500).send({ message: 'Error al obtener el docker_id del canal' });
        }

        if (!row || !row.docker_id) {
            // Si no se encuentra el canal o no tiene docker_id, envía una respuesta indicando que no existe o no está encendido
            return res.status(404).send({ message: 'Canal no encontrado o no está encendido' });
        }

        const dockerId = row.docker_id;

        // Detiene y elimina el contenedor Docker asociado al canal
        exec(`docker stop ${dockerId} && docker rm ${dockerId}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send({ message: 'Error al apagar el canal' });
            }

            // Actualiza la base de datos para eliminar los valores de docker_id y live_channel_id
            const updateQuery = `UPDATE canales SET docker_id = NULL, live_channel_id = NULL WHERE id = ?`;
            db.run(updateQuery, [id], function(updateErr) {
                if (updateErr) {
                    console.error(updateErr.message);
                    return res.status(500).send({ message: 'Error al actualizar la información del canal en la base de datos' });
                }
                res.send({ message: 'Canal apagado con éxito', id });
            });
        });
    });
});

app.listen(port, () => {
  console.log(`Servidor escuchando en puerto ${port}`);
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS canales (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      docker_id TEXT,
      live_channel_id INTEGER
    )`
  );
});


// Función para cerrar la base de datos cuando ya no sea necesaria
function cerrarDB() {
  db.close((err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Cierre de la conexión a la base de datos.');
  });
}

// No olvides llamar a cerrarDB() cuando sea apropiado, como al cerrar tu aplicación.

// Crear canal
app.post('/api/canales', (req, res) => {
  const { id, nombre } = req.body;
  if (!id || !nombre) {
    return res.status(400).send({ error: "El id y el nombre son requeridos." });
  }

  const query = `INSERT INTO canales (id, nombre, docker_id) VALUES (?, ?, ?)`;
  db.run(query, [id, nombre, null], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: "Error al crear el canal." });
    }
    res.status(201).send({ mensaje: "Canal creado exitosamente", canalId: this.lastID });
  });
});

// Obtener todos los canales
app.get('/api/canales', (req, res) => {
  db.all("SELECT id, nombre, docker_id FROM canales", [], (err, filas) => {
    if (err) {
      console.error(err.message);
      res.status(500).send({ error: "Error al obtener los canales" });
      return;
    }
    res.status(200).json(filas);
  });
});

// Eliminar canal
app.delete('/api/canales/:id', (req, res) => {
    const { id } = req.params; // Obtiene el ID del canal desde el parámetro URL

    // Prepara y ejecuta la consulta SQL para eliminar el canal
    const query = `DELETE FROM canales WHERE id = ?`;
    db.run(query, id, function(err) {
        if (err) {
            // Si ocurre un error durante la eliminación, envía una respuesta de error
            console.error(err.message);
            res.status(500).send({ error: "Error al eliminar el canal." });
            return;
        }
        if (this.changes > 0) {
            // Si la eliminación fue exitosa y afectó al menos una fila, envía una respuesta de éxito
            res.status(200).send({ mensaje: "Canal eliminado exitosamente" });
        } else {
            // Si no se encontró el canal (ninguna fila afectada), informa que el canal no fue encontrado
            res.status(404).send({ mensaje: "Canal no encontrado" });
        }
    });
});