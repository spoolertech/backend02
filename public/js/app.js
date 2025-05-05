const socket = io();

document.getElementById('addTurnForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    if (nombre && fecha && hora) {
        socket.emit('agregarTurno', { nombre, fecha, hora, id: Date.now() });

        document.getElementById('nombre').value = '';
        document.getElementById('fecha').value = '';
        document.getElementById('hora').value = '';
    } else {
        Swal.fire({
            icon: 'error',
            title: '¡Error!',
            text: 'Todos los campos son obligatorios.',
        });
    }
});

function deleteTurn(id) {
    Swal.fire({
        title: '¿Estás seguro?',
        text: "¡Este turno se eliminará permanentemente!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminarlo',
        cancelButtonText: 'Cancelar'
    }).then((result) => {
        if (result.isConfirmed) {
            socket.emit('eliminarTurno', id);

            Swal.fire(
                'Eliminado',
                'El turno ha sido eliminado.',
                'success'
            );
        }
    });
}

socket.on('turnoAgregado', (turno) => {
    const ul = document.getElementById('turnList');
    const li = document.createElement('li');
    li.id = `turn-${turno.id}`;
    li.textContent = `${turno.nombre} - ${turno.fecha} a las ${turno.hora}`;
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Eliminar';
    deleteButton.onclick = () => deleteTurn(turno.id);
    li.appendChild(deleteButton);
    ul.appendChild(li);

    Swal.fire({
        icon: 'success',
        title: 'Turno Agendado',
        text: `El turno de ${turno.nombre} ha sido agendado con éxito.`,
    });
});

socket.on('turnoEliminado', (id) => {
    const li = document.getElementById(`turn-${id}`);
    if (li) {
        li.remove();
        Swal.fire({
            icon: 'success',
            title: 'Turno Eliminado',
            text: 'El turno ha sido eliminado correctamente.',
        });
    }
});
