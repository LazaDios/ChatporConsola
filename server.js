const { Server } = require('net');

const host = '0.0.0.0';
const END = 'END'; //para serrar concecton

const connections = new Map();


const error = (mensaje) => {
    console.log(mensaje);
    process.exit(1);
}

const sendMessage = (mensaje, origin) => {
    //mandar a todos menso a origin el mensaje
    for (const socket of connections.keys()) {
        //si ese user es diferente al que mando el mensaje se le manda todos los demas
        if (socket !== origin) {
            socket.write(mensaje);
        }
    }
}


const listen = (port) => {
    const server = new Server();
    //Cuando ocurra una conceccion , me dará un Socket (Enchufe)
    server.on("connection", (socket) => { /*Para comunicarte con una maquina necesitas un socket*/
        const remoteSocket = ` ${socket.remoteAddress} : ${socket.remotePort}`;

        console.log(`Nueva Coneccion Para ${remoteSocket}`);//obtener informacion , renoteAddress es la direccion de la maquina que se acaba de conectar
        socket.setEncoding('utf-8'); //con esto cada vez que se lea dato lo codificamos


        //   /*Cuando tenga que leer algo en este socket , me daran unos datos que seran binarios*/
        socket.on("data", (mensaje) => {
            //si este socket no esta en mi map , es porque es el primer msj mandado
            if (!connections.has(socket)) {
                console.log(`Nombre ${mensaje} Colocar a la Coneccion: ${remoteSocket}`);
                connections.set(socket, mensaje);
            }
            else if (mensaje === END) {
                console.log(`Coneccion para ${remoteSocket} cerrada`);
                connections.delete(socket);
                socket.end();

            } else {
                //Enviar el mensaje al resto de Clientes 
                const fullMessage = `[${connections.get(socket)}] : ${mensaje}`;
                console.log(`${remoteSocket} -> ${fullMessage}`);
               sendMessage(fullMessage, socket);
            }
        });

        socket.on("error", (err) => error(err.mensaje));

    });

    /*host:0.0.0.0 , para aceptar solo conecciones ipv4*/
    server.listen({ port, host }, () => {
        console.log('Escuchando puerto 8000...');
    });

    server.on("error", (err) => error(err.mensaje));

}


const main = () => {
    if (process.argv.length !== 3) {
        error(`Usage: node ${__filename} port`); //llamamos al node server.js y puerto
    }
    let port = process.argv[2];
    if (isNaN(port)) {
        error(`Puerto Invalido ${port}`);
    }
    port = Number(port);
    listen(port);
}

if (require.main === module) {
    main();
}
