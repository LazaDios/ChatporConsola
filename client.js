const { Socket } = require('net');
const readline = require('readline').createInterface({
    input: process.stdin, //la consola
    output: process.stdout
});


const END = 'END';

const error = (mensaje) => {
    console.log(mensaje);
    process.exit(1);
}

const connect = (host, port) => {

    console.log(`Conectado a ${host} : ${port}`);

    const socket = new Socket();
    /*Conectar mi pc al puerto 8000*/
    socket.connect({ host, port });
    socket.setEncoding('utf-8');

    //Despues de estar conectados....
    socket.on("connect", () => {
        console.log("Conectado..");
        readline.question("DAME UN NOMBRE: ", (username) => {
            socket.write(username);
            console.log(`Escribe cualquier mensaje que quieras enviar , y END para finalizar Chat`);
        });
        readline.on("line", (mensaje) => {
            socket.write(mensaje);
            if (mensaje === END) {
                socket.end();
                console.log("Desconectado");
                process.exit(0);
            }
        });

        socket.on("data", (data) => {
            console.log(data);
        });
    });

    //si hay un errro al conectar:
    socket.on("error", (err) => error(err.mensaje))
};
//socket.on("close", () => process.exit(0));

const main = () => {
    if (process.argv.length !== 4) {
        error(`Usage: node ${__filename} host port `)
    }
    let [, , host, port] = process.argv;
    if (isNaN(port)) {
        error(`Puerto invalido ${port}`);
    }
    connect(host, port);


}
//Decirle si este modulo es el principal

if (module === require.main) {
    main();
}

