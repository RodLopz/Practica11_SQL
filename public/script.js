document.addEventListener("DOMContentLoaded", function() {
    // Espera a que el DOM esté completamente cargado

    // Hacer una solicitud GET al servidor cuando se cargue la página
    fetch('/cursos')
        .then(response => {
            // Verificar si la respuesta es exitosa (código de estado 200)
            if (!response.ok) {
                throw new Error('Error al obtener los cursos');
            }
            // Convertir la respuesta a JSON
            return response.json();
        })
        .then(data => {
            // Manipular los datos recibidos
            mostrarCursos(data);
        })
        .catch(error => {
            // Manejar errores
            console.error('Error:', error);
        });

    function mostrarCursos(cursos) {
        // Obtener el elemento en el DOM donde se mostrarán los cursos
        const tablaCursos = document.getElementById('tabla-cursos');

        // Crear una tabla para mostrar los cursos
        let tablaHTML = '<table><thead><tr><th>Fecha</th><th>Nivel</th><th>Descripción</th><th>Lugar</th><th>Nombre</th></tr></thead><tbody>';
        cursos.forEach(curso => {
            tablaHTML += `<tr><td>${curso.fecha}</td><td>${curso.nivel}</td><td>${curso.descripcion}</td><td>${curso.lugar}</td><td>${curso.nombre}</td></tr>`;
        });
        tablaHTML += '</tbody></table>';

        // Agregar la tabla al elemento en el DOM
        tablaCursos.innerHTML = tablaHTML;
    }
});
