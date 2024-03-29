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
    db.all("SELECT raw_live_id, transcoding_live_id FROM canales ORDER BY raw_live_id ASC, transcoding_live_id ASC", [], (err, rows) => {
        if (err) {
            console.error(`Error de base de datos: ${err.message}`);
            callback(err, null);
            return;
        }

        let nextAvailableId = 0;

        const combinedIds = rows.flatMap(row => [Number(row.raw_live_id), Number(row.transcoding_live_id)]).sort((a, b) => a - b);

        while (combinedIds.includes(nextAvailableId)) {
            nextAvailableId++;
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

                const updateQuery = `UPDATE canales SET docker_id = ?, raw_live_id = ? WHERE id = ?`;
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

// Apagar canal raw (sin transcoding)
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
        exec(`docker kill ${dockerId} && docker rm ${dockerId}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send({ message: 'Error al apagar el canal' });
            }

            const updateQuery = `UPDATE canales SET docker_id = NULL, raw_live_id = NULL WHERE id = ?`;
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

// Encender canal con transcoding
app.post('/api/canales/encender/transcode/:id', (req, res) => {
    const { id } = req.params; 

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
        getNextAvailableId((err, transcodingLiveId) => {
            if (err) {
                return res.status(500).send({ message: 'Error al obtener el próximo liveChannelId disponible' });
            }

            const port = 8050 + transcodingLiveId;

            exec(`STREAM_ID=${id} LIVE_CHANNEL_ID=${transcodingLiveId} docker compose -p transcoding-${transcodingLiveId} up -d`, (error, stdout) => {
                if (error) {
                    console.error(`exec error: ${error}`);
                    return res.status(500).send({ message: 'Error al encender el canal'});
                }
                const transcodingId = `transcoding-${transcodingLiveId}`;

                const updateQuery = `UPDATE canales SET transcoding_id = ?, transcoding_live_id = ? WHERE id = ?`;
                db.run(updateQuery, [transcodingId, transcodingLiveId, id], function(updateErr) {
                    if (updateErr) {
                        console.error(updateErr.message);
                        return res.status(500).send({ message: 'Error al actualizar la información del canal' });
                    }
                    res.send({ message: 'Canal encendido con éxito', id, transcodingLiveId, port, transcodingId });
                });
            });
        });
    });
});

// Apagar canal con transcoding
app.delete('/api/canales/apagar/transcode/:id', (req, res) => {
    const { id } = req.params; 

    const getDockerIdQuery = `SELECT transcoding_id, transcoding_live_id FROM canales WHERE id = ?`;
    db.get(getDockerIdQuery, [id], (getErr, row) => {

        if (getErr) {
            console.error(`Error al obtener el transcoding_id del canal: ${getErr}`);
            return res.status(500).send({ message: 'Error al obtener el transcoding_id del canal' });
        }

        if (!row || !row.transcoding_id) {
            return res.status(404).send({ message: 'Canal no encontrado o no está encendido' });
        }

        exec(`docker compose -p transcoding-${row.transcoding_live_id} kill && docker compose -p transcoding-${row.transcoding_live_id} rm -f`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return res.status(500).send({ message: 'Error al apagar el canal' });
            }

            const updateQuery = `UPDATE canales SET transcoding_id = NULL, transcoding_live_id = NULL WHERE id = ?`;
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

app.get('/api/canales/getLiveID/:id', (req, res) => {
    const { id } = req.params; // Extrae el ID del canal de los parámetros de la URL

    const query = 'SELECT raw_live_id, transcoding_live_id FROM canales WHERE id = ?';

    db.get(query, [id], (err, row) => {
        if (err) {
            console.error('Error al realizar la consulta en la base de datos', err);
            res.status(500).send({ error: 'Error al consultar la base de datos' });
            return;
        }
        if (row) {
            res.status(200).send({ raw_live_id: row.raw_live_id, transcoding_live_id: row.transcoding_live_id });
        } else {
            res.status(404).send({ error: 'Canal no encontrado' });
        }
    });
});

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS canales (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      docker_id TEXT,
      transcoding_id,
      raw_live_id INTEGER,
      transcoding_live_id INTEGER
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
  const { id, name } = req.body;
  if (!id || !name) {
    return res.status(400).send({ error: "El id y el nombre son requeridos." });
  }

  const query = `INSERT INTO canales (id, name) VALUES (?, ?)`;
  db.run(query, [id, name], function(err) {
    if (err) {
      console.error(err.message);
      return res.status(500).send({ error: "Error al crear el canal." });
    }
    res.status(201).send({ mensaje: "Canal creado exitosamente", canalId: this.lastID });
  });
});

// Obtener todos los canales
app.get('/api/canales', (req, res) => {
  db.all("SELECT id, name, docker_id, transcoding_id, raw_live_id, transcoding_live_id FROM canales", [], (err, filas) => {
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




app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
  });
  