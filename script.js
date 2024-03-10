// const url = '82.165.10.57:3000'
const url = 'ap1.casaroja.app';

function encenderCanalRaw(id) {
    showLoader(`Encendiendo canal sin transcoding, id ${id}`);
    fetch(`https://${url}/api/canales/encender/raw/${id}`, { // Asegúrate de que la URL coincida con tu endpoint en el servidor.
        method: 'POST',
    })
    .then(response => {
        hideLoader();
        if (!response.ok) {
            // Si el servidor responde con un error, lanza un Error para manejarlo en el catch.
            throw new Error('Error al encender el canal');
        }
        return response.json(); // Convierte la respuesta del servidor a JSON.
    })
    .then(data => {
        hideLoader();
        // Manejo de la respuesta exitosa.
        // console.log(data);
        //alert(`Canal ${id} encendido con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        hideLoader();
        console.error('Error al encender el canal:', error);
        //alert('No se pudo encender el canal. Verifica la consola para más detalles.');
    });
}

function apagarCanalRaw(id) {
    showLoader(`Apagando canal sin transcoding, id ${id}`);
    fetch(`https://${url}/api/canales/apagar/raw/${id}`, { // Asegúrate de que la URL coincida con tu endpoint en el servidor.
        method: 'DELETE',
    })
    .then(response => {
        hideLoader();
        if (!response.ok) {
            // Si el servidor responde con un error, lanza un Error para manejarlo en el catch.
            throw new Error('Error al apagar el canal');
        }
        return response.json(); // Convierte la respuesta del servidor a JSON.
    })
    .then(data => {
        hideLoader();
        // console.log(data);
        //alert(`Canal ${id} apagado con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        hideLoader();
        console.error('Error al apagar el canal:', error);
        //alert('No se pudo apagar el canal. Verifica la consola para más detalles.');
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
            const rawLiveId = data.raw_live_id; // Asume que el servidor devuelve un objeto con esta propiedad.
            const urlFinal = `https://${url}/watch/${rawLiveId}/ace/manifest.m3u8?id=${id}`;
            if (ventana) ventana.location.href = urlFinal; 
        })
        .catch(error => {
            console.error('Error:', error);
            //alert('Error al ver el canal. Por favor, intente de nuevo más tarde.');
            if (ventana) ventana.close(); 
        });
}

function encenderCanalTranscode(id) {
    showLoader(`Encendiendo canal con transcoding, id ${id}`);
    const loadingMessage = document.getElementById('loadingMessage');
    fetch(`https://${url}/api/canales/encender/transcode/${id}`, {
        method: 'POST',
    })
    .then(response => {
        hideLoader();
        if (!response.ok) {
            throw new Error('Error al encender el canal');
        }
        return response.json();
    })
    .then(data => {
        let counter = 5; 
        loadingMessage.textContent = `Por favor, espera ${counter} segundos mientras el stream se estabiliza.`; 

        const intervalId = setInterval(() => {
            counter--; 
            loadingMessage.textContent = `Por favor, espera ${counter} segundos mientras el stream se estabiliza.`; 

            if (counter === 0) {
                clearInterval(textContent); 
                hideLoader();
                loadingMessage.innerText = ''; 
                obtenerCanalesYMostrar();
            }
        }, 1000); 
    })
    .catch(error => {
        hideLoader();
        console.error('Error al encender el canal:', error);
        //alert('No se pudo encender el canal. Verifica la consola para más detalles.');
    });
}

function apagarCanalTranscode(id) {
    showLoader(`Apagando canal con transcoding, id ${id}`);
    fetch(`https://${url}/api/canales/apagar/transcode/${id}`, { 
        method: 'DELETE',
    })
    .then(response => {
        hideLoader();
        if (!response.ok) {
            throw new Error('Error al apagar el canal');
        }
        return response.json(); 
    })
    .then(data => {
        hideLoader();
        // console.log(data);
        //alert(`Canal ${id} apagado con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        hideLoader();
        console.error('Error al apagar el canal:', error);
        //alert('No se pudo apagar el canal. Verifica la consola para más detalles.');
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
            const transcodingLiveId = data.transcoding_live_id;
            const urlFinal = `https://${url}/watch/${transcodingLiveId}/output.m3u8`;
            if (ventana) ventana.location.href = urlFinal; 
        })
        .catch(error => {
            console.error('Error:', error);
            //alert('Error al ver el canal. Por favor, intente de nuevo más tarde.');
            if (ventana) ventana.close(); 
        });
}

function showLoader(msg, seconds) {
  const loadingScreen = document.getElementById('loading-screen');
  const loadingMessage = document.getElementById('loading-message');
  loadingMessage.textContent = msg; 
  loadingScreen.classList.remove('hidden'); 
}

function hideLoader() {
  const loadingScreen = document.getElementById('loading-screen');
  loadingScreen.classList.add('hidden'); // Oculta la pantalla de carga
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
        // //alert("Canal eliminado exitosamente");
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
            return response.json(); 
        })
        .then(function (canales) {
            const listaCanales = document.getElementById('lista-canales');
            listaCanales.innerHTML = ''; // Limpia la lista antes de añadir los elementos actualizados
            canales.forEach(canal => {
                const elemento = document.createElement('div');
                elemento.classList.add("m-7");
                let html = `<h3>Nombre: ${canal.name}</h3>
                            <p>ID: ${canal.id}</p>
                            <p>Docker ID: ${canal.docker_id || 'No Encendido'}</p>
                            <p>Transcoding ID: ${canal.transcoding_id || 'No Encendido'}</p>
                            <p>Raw Live ID: ${canal.raw_live_id || 'No Encendido'}</p>
                            <p>Transcoding Live ID: ${canal.transcoding_live_id || 'No Encendido'}</p>
                            <button class="channel-button" onclick="eliminarCanal('${canal.id}')">Eliminar</button>
                            <br>
                            `;
                
                if (canal.docker_id) {
                    html += `<button class="channel-button" onclick="apagarCanalRaw('${canal.id}')">Apagar Raw</button>
                             <button class="channel-button" onclick="verCanalRaw('${canal.id}')">Ver Raw</button>
                             <br>
                             `;
                }
                else {
                    html += `<button class="channel-button" onclick="encenderCanalRaw('${canal.id}')">Encender Raw</button>
                             <br>
                             `;
                }

                if (canal.transcoding_id) {
                    html += `<button class="channel-button" onclick="apagarCanalTranscode('${canal.id}')">Apagar Transcode</button>
                             <button class="channel-button" onclick="verCanalTranscode('${canal.id}')">Ver Transcode</button>`;
                }
                else {
                    html += `<button class="channel-button" onclick="encenderCanalTranscode('${canal.id}')">Encender Transcode</button>`;
                }
                
                
                elemento.innerHTML = html;
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

        const name = document.getElementById("channel-name").value;
        const id = document.getElementById("id-canal").value;

        // Objeto con los datos del canal a crear
        const datosCanal = { id, name };

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
            ////alert("Canal creado exitosamente");
            document.getElementById("channel-name").value = '';
            document.getElementById("id-canal").value = '';
            obtenerCanalesYMostrar();
        })
        .catch((error) => {
            console.error("Error al crear el canal:", error);
        });
    });
});
