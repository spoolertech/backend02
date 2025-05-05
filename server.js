const express = require('express');
const { engine } = require('express-handlebars');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.engine('handlebars', engine({
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts',
}));
app.set('view engine', 'handlebars');


app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let turnos = [];

app.get('/', (req, res) => {
  res.render('home', { turnos });
});

app.get('/realtime-turns', (req, res) => {
  res.render('realTimeTurns', { turnos });
});

app.post('/add-turn', (req, res) => {
  const { nombre, fecha, hora } = req.body;
  const nuevoTurno = { nombre, fecha, hora, id: Date.now() };
  turnos.push(nuevoTurno);
  io.emit('turnoAgregado', nuevoTurno);
  res.redirect('/');
});

app.post('/delete-turn', (req, res) => {
  const { id } = req.body;
  turnos = turnos.filter(turno => turno.id !== Number(id));
  io.emit('turnoEliminado', id);
  res.redirect('/');
});

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on('agregarTurno', (turno) => {
    turnos.push(turno);
    io.emit('turnoAgregado', turno);
  });

  socket.on('eliminarTurno', (id) => {
    turnos = turnos.filter(turno => turno.id !== id);
    io.emit('turnoEliminado', id);
  });

  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
