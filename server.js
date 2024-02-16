const express = require('express')
var fs = require('fs');
const bodyParser = require('body-parser')
const mysql = require('mysql')

const app = express()
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

// Parsing middleware
// Parse application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: false })); // Remove 
app.use(express.urlencoded({extended: true})); // New
// Parse application/json
// app.use(bodyParser.json()); // Remove
app.use(express.json()); // New


// MySQL Code goes here
const pool  = mysql.createPool({
    connectionLimit : 5,
    host            : 'bb2ksrlhvlx7ux0f7hqu-mysql.services.clever-cloud.com',
    user            : 'ubw93utlvtc86op8',
    password        : 'pHhdsY3PnJBUTmKAP4T1',
    database        : 'bb2ksrlhvlx7ux0f7hqu'
})




//peticiones get
app.get('/', (req, response) => {
    var contenido = fs.readFileSync("public/index.html");
    response.setHeader("Content-type", "text/html");
    response.send(contenido);
});

app.get('/cursos', (req, res) => {
    pool.query('SELECT * FROM cursos', (error, results, fields) => {
        if (error) {
            res.status(500).json({ error: 'Error al obtener cursos.' });
            return;
        }
        // Envía la tabla de cursos HTML
        const tablaHTML = generarTablaCursosHTML(results);
        // Si la solicitud acepta HTML, envía cursos.html con la tabla incrustada
        if (req.accepts('html')) {
            const contenido = fs.readFileSync("public/cursos.html", "utf8");
            const cursosHTML = contenido.replace('<div id="tabla-cursos"></div>', `<div id="tabla-cursos">${tablaHTML}</div>`);
            res.status(200).send(cursosHTML);
        } else {
            // Si la solicitud no acepta HTML, envía solo la tabla HTML
            res.status(200).send(tablaHTML);
        }
    });
});

function generarTablaCursosHTML(cursos) {
    let tablaHTML = '<table><thead><tr><th>Fecha</th><th>Nivel</th><th>Descripción</th><th>Lugar</th><th>Nombre</th></tr></thead><tbody>';
    cursos.forEach(curso => {
        tablaHTML += `<tr><td>${curso.fecha_importacion}</td><td>${curso.nivel}</td><td>${curso.descripcion}</td><td>${curso.lugar}</td><td>${curso.nombre}</td></tr>`;
    });
    tablaHTML += '</tbody></table>';
    return tablaHTML;
}


/*
// Ruta GET para obtener los centros de formación
app.get('/centros', (req, res) => {
    // Consulta SQL para obtener los centros de formación
    const sql = 'SELECT * FROM centros';

    // Ejecutar la consulta en la base de datos
    pool.query(sql, (error, results) => {
        if (error) {
            // Si hay un error, enviar una respuesta de error al cliente
            res.status(500).json({ error: 'Error al obtener los centros de formación.' });
            return;
        }
        
        // Si la consulta se ejecuta correctamente, enviar los resultados al cliente
        res.status(200).json(results);
    });
});

*/

app.get('/centros', (req, res) => {
    pool.query('SELECT * FROM centros', (error, results, fields) => {
        if (error) {
            res.status(500).json({ error: 'Error al obtener cursos.' });
            return;
        }
        // Envía la tabla de cursos HTML
        const tablaHTML = generarTablaCentrosHTML(results);
        // Si la solicitud acepta HTML, envía cursos.html con la tabla incrustada
        if (req.accepts('html')) {
            const contenido = fs.readFileSync("public/centros.html", "utf8");
            const cursosHTML = contenido.replace('<div id="tabla-centros"></div>', `<div id="tabla-centros">${tablaHTML}</div>`);
            res.status(200).send(cursosHTML);
        } else {
            // Si la solicitud no acepta HTML, envía solo la tabla HTML
            res.status(200).send(tablaHTML);
        }
    });
});

function generarTablaCentrosHTML(cursos) {
    let tablaHTML = '<table><thead><tr><th>ID</th><th>Nombre</th><th>Direccion</th><th>Telefono</th></tr></thead><tbody>';
    cursos.forEach(curso => {
        tablaHTML += `<tr><td>${curso.id}</td><td>${curso.nombre}</td><td>${curso.direccion}</td><td>${curso.telefono}</td></tr>`;
    });
    tablaHTML += '</tbody></table>';
    return tablaHTML;
}



app.get('/matriculados/:id_curso', (req, res) => {
    const idCurso = req.params.id_curso;

    // Consulta SQL para obtener los alumnos matriculados en el curso
    const sql = `SELECT alumnos.nombre, matriculas.estado 
                 FROM matriculas
                 INNER JOIN alumnos ON matriculas.id_alumno = alumnos.id
                 WHERE matriculas.id_curso = ?`;

    // Ejecutar la consulta en la base de datos
    pool.query(sql, [idCurso], (error, results) => {
        if (error) {
            res.status(500).json({ error: 'Error al obtener los alumnos matriculados.' });
            return;
        }

        // Generar la página HTML dinámica con la lista de alumnos matriculados
        let html = '<h2>Listado de Alumnos Matriculados</h2>';
        html += '<ul>';
        results.forEach(alumno => {
            html += `<li>${alumno.nombre} - Estado: ${alumno.estado}  `;
            html += `<button onclick="eliminarAlumno(${idCurso}, '${alumno.nombre}')">Eliminar</button></li>`;
        });
        html += '</ul>';

        res.send(html);
    });
});

app.get('/matriculados', (req, res) => {
    // Envía el archivo HTML matriculados.html como respuesta
    res.sendFile(__dirname + '/public/matriculados.html');
});


app.get('/modificar', (req, res) => {
    // Envía el archivo HTML matriculados.html como respuesta
    res.sendFile(__dirname + '/public/modiCurs.html');
});


// Ruta GET para cargar la página de modificación de curso
app.get('/modificar/:id_curso', (req, res) => {
    const idCurso = req.params.id_curso;
    // Consulta SQL para obtener la información del curso
    const sql = 'SELECT * FROM cursos WHERE id = ?'
    // Ejecutar la consulta en la base de datos
    pool.query(sql, [idCurso], (error, results) => {
        if (error || results.length === 0) {
            // Si hay un error o no se encuentra el curso, redirigir a una página de error o mostrar un mensaje
            res.status(404).send('Curso no encontrado.');
            return;
        }
        // Renderizar la página de modificación de curso con los datos del curso
        res.render('modificarCurso', { curso: results[0] });
    });
});

/*
// Ruta POST para manejar las solicitudes de actualización de curso
app.post('/modificar/:id_curso', (req, res) => {
    const idCurso = req.params.id_curso;
    const { fecha, nivel, descripcion, lugar, nombre } = req.body;

    // Consulta SQL para actualizar la información del curso en la base de datos
    const sql = 'UPDATE cursos SET fecha_importacion = ?, nivel = ?, descripcion = ?, lugar = ?, nombre = ? WHERE id = ?';

    // Ejecutar la consulta en la base de datos
    pool.query(sql, [fecha, nivel, descripcion, lugar, nombre, idCurso], (error, results) => {
        if (error) {
            // Si hay un error, enviar una respuesta de error al cliente
            res.status(500).send('Error al actualizar el curso.');
            return;
        }

        // Redirigir al usuario de vuelta a la página de modificación de curso
        res.redirect(`/modificar/${idCurso}`);
    });
});
*/

//Pruta
app.post('/modificar/:id_curso', (req, res) => {
    const { id_curso } = req.params;
    const { fecha_importacion, nivel, descripcion, lugar, nombre } = req.body;
    pool.query('UPDATE cursos SET fecha_importacion = ?, nivel = ?, descripcion = ?, lugar = ?, nombre = ? WHERE id = ?', 
                [fecha_importacion, nivel, descripcion, lugar, nombre, id_curso], (err) => {
                    if (err) {
                        // Si hay un error, enviar una respuesta de error al cliente
                        res.status(500).send('Error al actualizar el curso.');
                        return;
                    } // Corregir el nombre de la variable de error
       res.redirect(`/cursos`);
    });
   
});


app.get('/mgraficas', (req, res) => {
    // Envía el archivo HTML matriculados.html como respuesta
    res.sendFile(__dirname + '/public/graficas.html');
});
app.get('/graficas', (req, res) => {
    // Consulta SQL para obtener el ratio de alumnos aprobados por el total de matriculados para cada curso
    const sql = `
        SELECT 
            cursos.nombre AS nombre_curso,
            COUNT(CASE WHEN matriculas.estado = 'aprobado' THEN 1 ELSE NULL END) AS aprobados,
            COUNT(*) AS total_matriculados
        FROM 
            cursos
        LEFT JOIN 
            matriculas ON cursos.id = matriculas.id_curso
        GROUP BY 
            cursos.nombre;
    `;

    // Ejecutar la consulta en la base de datos
    pool.query(sql, (error, results) => {
        if (error) {
            // Si hay un error, redirigir a una página de error o mostrar un mensaje
            res.status(500).send('Error al obtener datos para las gráficas.');
            return;
        }

        // Extraer los datos del resultado de la consulta
        const datosGrafica = results.map(row => ({
            nombreCurso: row.nombre_curso,
            alumnosAprobados: row.aprobados,
            totalMatriculados: row.total_matriculados
        }));

        // Enviar los datos al cliente en formato JSON
        res.json(datosGrafica);
    });
});






// post
app.post('/wordpress', (req, res) => {
;
console.log(req.body.parametro);
    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log('connected as id ' + connection.threadId)
        connection.query("SELECT * from wp_options WHERE option_name='"+req.body.parametro+"'", (err, rows) => {
            connection.release() // return the connection to pool

            if (!err) {
                res.send(rows)
            } else {
                //console.log(err)
            }

            // if(err) throw err
            //console.log('The data from beer table are: \n', rows)
        })
    })
})

// Add beer
app.post('/crearProducto', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        
        const {nombre,descripcion,precio } = req.body;
        const params={nombre,descripcion,precio };

        connection.query('INSERT INTO productos SET ?', params, 
        (err, rows) => {
        connection.release() // return the connection to pool
        if (!err) {
            res.send(`productos with the record ID `+rows.insertId+' se ha añadido.')
        } else {
            console.log(err)
        }
        
        console.log('The data from productos table are:11 \n', rows)

        })
    })
});

app.put('/actualizarProducto', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        console.log(`connected as id ${connection.threadId}`)

        const { nombre, precio, descripcion, id } = req.body

        connection.query('UPDATE productos SET  nombre = ?, descripcion = ?, precio = ? WHERE id = ?', [nombre, descripcion, precio,id] , (err, rows) => {
            connection.release() // return the connection to pool

            if(!err) {
                res.send(`Beer with the name: ${nombre} has been added.`)
            } else {
                console.log(err)
            }

        })

        console.log(req.body)
    })
})



app.delete('/borrarProducto/:id', (req, res) => {

    pool.getConnection((err, connection) => {
        if(err) throw err
        connection.query('DELETE FROM productos WHERE id = ?', [req.params.id], (err, rows) => {
            connection.release() // return the connection to pool
            if (!err) {
                res.send(`Productos with the record ID ${[req.params.id]} has been removed.`)
            } else {
                console.log(err)
            }
            
            console.log('The data from beer table are: \n', rows)
        })
    })
});
// Listen on enviroment port or 3000
app.listen(port, () => console.log(`Listening on port ${port}`))



