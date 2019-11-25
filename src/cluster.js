const cluster = require("cluster");
const os = require("os");
const colors = require("colors"); //colors for console

const setupWorkerProcesses = () => {
  if (cluster.isMaster) {
    const argv = require('minimist')(process.argv.slice(2));

    let numCores;
    if("multicore" in argv && argv["multicore"]){
      numCores = os.cpus().length;
    } else {
      numCores = 1
    }

    console.log(
      `O SAP irá iniciar em modo cluster com ${numCores} worker(s)`.bold.blue
    );
    for (let i = 0; i < numCores; i++) {
      let newCluster = cluster.fork();

      newCluster.on("message", function(message) {
        console.log(message);
      });
    }
    cluster.on("online", function(worker) {
      console.log(`Worker ${worker.process.pid} iniciado`.blue);
    });
    cluster.on("exit", function(worker, code, signal) {
      console.log(
        `Worker ${worker.process.pid} morreu com código ${code} e sinal ${signal}`
          .red
      );
    });
  }
};

module.exports = { setupWorkerProcesses, isMaster: cluster.isMaster };
