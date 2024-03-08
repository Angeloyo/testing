// const url = '82.165.10.57:3000'
const url = 'ap1.casaroja.app';



function encenderCanalRaw(id) {

    fetch(`/api/canales/encender/raw/${id}`, { // Asegúrate de que la URL coincida con tu endpoint en el servidor.
        method: 'POST',
    })
    .then(response => {
        if (!response.ok) {
            // Si el servidor responde con un error, lanza un Error para manejarlo en el catch.
            throw new Error('Error al apagar el canal');
        }
        return response.json(); // Convierte la respuesta del servidor a JSON.
    })
    .then(data => {
        // Manejo de la respuesta exitosa.
        console.log(data);
        alert(`Canal ${id} encendido con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        console.error('Error al encender el canal:', error);
        alert('No se pudo encender el canal. Verifica la consola para más detalles.');
    });
}

function apagarCanalRaw(id) {

    fetch(`/api/canales/apagar/raw/${id}`, { // Asegúrate de que la URL coincida con tu endpoint en el servidor.
        method: 'POST',
    })
    .then(response => {
        if (!response.ok) {
            // Si el servidor responde con un error, lanza un Error para manejarlo en el catch.
            throw new Error('Error al apagar el canal');
        }
        return response.json(); // Convierte la respuesta del servidor a JSON.
    })
    .then(data => {
        // Manejo de la respuesta exitosa.
        console.log(data);
        alert(`Canal ${id} encendido con éxito`);
        obtenerCanalesYMostrar();
    })
    .catch(error => {
        console.error('Error al encender el canal:', error);
        alert('No se pudo apagar el canal. Verifica la consola para más detalles.');
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
    fetch(`/api/canales/${id}`, {
        method: 'DELETE',
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        return response.json();
    })
    .then(data => {
        console.log(data.mensaje);
        alert("Canal eliminado exitosamente");
        obtenerCanalesYMostrar(); // Recargar la lista de canales
    })
    .catch(error => console.error("Error al eliminar el canal:", error));
}

function obtenerCanalesYMostrar() {
    fetch('/api/canales')
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
                elemento.innerHTML = `Nombre: ${canal.nombre}, ID: ${canal.id}, Docker ID: ${canal.docker_id || 'No Encendido'}
                                      <button onclick="eliminarCanal('${canal.id}')">Eliminar</button>
                                      <button onclick="encenderCanalRaw('${canal.id}')">Encender Raw</button>
                                      <button onclick="apagarCanalRaw('${canal.id}')">Apagar Raw</button>`;
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

        console.log(datosCanal); // Añade esto para depurar

        // Envío de los datos al servidor usando fetch
        fetch("/api/canales", {
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
            console.log(data);
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
