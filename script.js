// const url = '82.165.10.57:3000'
const url = 'ap1.casaroja.app';

function encenderCanalRaw(id) {
    mostrarLoader()
    fetch(`https://${url}/api/canales/encender/raw/${id}`, { // Asegúrate de que la URL coincida con tu endpoint en el servidor.
        method: 'POST',
    })
    .then(response => {
        ocultarLoader()
        if (!response.ok) {
            // Si el servidor responde con un error, lanza un Error para manejarlo en el catch.
            throw new Error('Error al encender el canal');
        }
        return response.json(); // Convierte la respuesta del servidor a JSON.
    })
    .then(data => {
        ocultarLoader()
        // Manejo de la respuesta exitosa.
        // console.log(data);
        alert(`Canal ${id} encendido con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        ocultarLoader()
        console.error('Error al encender el canal:', error);
        alert('No se pudo encender el canal. Verifica la consola para más detalles.');
    });
}

function apagarCanalRaw(id) {
    mostrarLoader()
    fetch(`https://${url}/api/canales/apagar/raw/${id}`, { // Asegúrate de que la URL coincida con tu endpoint en el servidor.
        method: 'DELETE',
    })
    .then(response => {
        ocultarLoader()
        if (!response.ok) {
            // Si el servidor responde con un error, lanza un Error para manejarlo en el catch.
            throw new Error('Error al apagar el canal');
        }
        return response.json(); // Convierte la respuesta del servidor a JSON.
    })
    .then(data => {
        ocultarLoader()
        // console.log(data);
        alert(`Canal ${id} apagado con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        ocultarLoader()
        console.error('Error al apagar el canal:', error);
        alert('No se pudo apagar el canal. Verifica la consola para más detalles.');
    });
}

function verCanalRaw(id) {
    const ventana = window.open('', '_blank');
    if (ventana) ventana.document.write('Cargando...'); 

    fetch(`https://${url}/api/canales/getLiveID/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo obtener la información del canal.');
            }
            return response.json();
        })
        .then(data => {
            const liveChannelId = data.live_channel_id; // Asume que el servidor devuelve un objeto con esta propiedad.
            const urlFinal = `https://${url}/watch/${liveChannelId}/ace/manifest.m3u8?id=${id}`;
            if (ventana) ventana.location.href = urlFinal; 
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al ver el canal. Por favor, intente de nuevo más tarde.');
            if (ventana) ventana.close(); 
        });
}

function encenderCanalTranscode(id) {
    mostrarLoader()
    fetch(`https://${url}/api/canales/encender/transcode/${id}`, {
        method: 'POST',
    })
    .then(response => {
        ocultarLoader()
        if (!response.ok) {
            throw new Error('Error al encender el canal');
        }
        return response.json();
    })
    .then(data => {
        ocultarLoader()
        console.log(data);
        alert(`Canal ${id} encendido con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        ocultarLoader()
        console.error('Error al encender el canal:', error);
        alert('No se pudo encender el canal. Verifica la consola para más detalles.');
    });
}

function apagarCanalTranscode(id) {
    mostrarLoader()
    fetch(`https://${url}/api/canales/apagar/transcode/${id}`, { 
        method: 'DELETE',
    })
    .then(response => {
        ocultarLoader()
        if (!response.ok) {
            throw new Error('Error al apagar el canal');
        }
        return response.json(); 
    })
    .then(data => {
        ocultarLoader()
        // console.log(data);
        alert(`Canal ${id} apagado con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        ocultarLoader()
        console.error('Error al apagar el canal:', error);
        alert('No se pudo apagar el canal. Verifica la consola para más detalles.');
    });
}

function verCanalTranscode(id) {
    const ventana = window.open('', '_blank');
    if (ventana) ventana.document.write('Cargando...'); 

    fetch(`https://${url}/api/canales/getLiveID/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo obtener la información del canal.');
            }
            return response.json();
        })
        .then(data => {
            const liveChannelId = data.live_channel_id;
            const urlFinal = `https://${url}/watch/${liveChannelId}/output.m3u8`;
            if (ventana) ventana.location.href = urlFinal; 
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al ver el canal. Por favor, intente de nuevo más tarde.');
            if (ventana) ventana.close(); 
        });
}

function mostrarLoader() {
    document.getElementById('loader').style.display = 'block';
}

function ocultarLoader() {
    document.getElementById('loader').style.display = 'none';
}

window.onload = function() {
    obtenerCanalesYMostrar();
};

function eliminarCanal(id) {
    fetch(`https://${url}/api/canales/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        // console.log(data.mensaje);
        alert("Canal eliminado exitosamente");
        obtenerCanalesYMostrar(); // Recargar la lista de canales
    })
    .catch(error => console.error("Error al eliminar el canal:", error));
}

function obtenerCanalesYMostrar() {
    fetch(`https://${url}/api/canales`)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Parsea la respuesta JSON
        })
        .then(function (canales) {
            const listaCanales = document.getElementById('lista-canales');
            listaCanales.innerHTML = ''; // Limpiar la lista antes de mostrar los resultados
            canales.forEach(canal => {
                const elemento = document.createElement('div');
                elemento.innerHTML = `<h3>Nombre: ${canal.nombre}</h3>
                                      <h3>ID: ${canal.id}</h3>
                                      <h3>Docker ID: ${canal.docker_id || 'No Encendido'}</h3>
                                      <h3>Transcoding ID: ${canal.transcoding_id || 'No Encendido'}</h3>
                                      <button onclick="eliminarCanal('${canal.id}')">Eliminar</button>
                                      <button onclick="encenderCanalRaw('${canal.id}')">Encender Raw</button>
                                      <button onclick="apagarCanalRaw('${canal.id}')">Apagar Raw</button>
                                      <button onclick="verCanalRaw('${canal.id}')">Ver Raw</button>
                                      <button onclick="encenderCanalTranscode('${canal.id}')">Encender Transcode</button>
                                      <button onclick="apagarCanalTranscode('${canal.id}')">Apagar Transcode</button>
                                      <button onclick="verCanalTranscode('${canal.id}')">Ver Transcode</button>
                                      `;
                listaCanales.appendChild(elemento);
            });
        })
        .catch(function (error) {
            console.error('Error al obtener los canales:', error);
        });
}

// Crear canal form
document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("crear-canal-form");

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Evitar el envío del formulario por defecto

        const nombre = document.getElementById("nombre-canal").value;
        const id = document.getElementById("id-canal").value;

        // Objeto con los datos del canal a crear
        const datosCanal = { id, nombre };

        // console.log(datosCanal);

        // Envío de los datos al servidor usando fetch
        fetch(`https://${url}/api/canales`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(datosCanal),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            return response.json();
        })
        .then(data => {
            // console.log(data);
            alert("Canal creado exitosamente");
            document.getElementById("nombre-canal").value = '';
            document.getElementById("id-canal").value = '';
            obtenerCanalesYMostrar();
        })
        .catch((error) => {
            console.error("Error al crear el canal:", error);
        });
    });
});
