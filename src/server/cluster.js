const cluster = require("cluster");
const os = require("os");

const { logger } = require("../utils");

const setupWorkerProcesses = () => {
  if (cluster.isMaster) {
    const argv = require("minimist")(process.argv.slice(2));

    let numCores;
    if ("multicore" in argv && argv["multicore"]) {
      numCores = os.cpus().length;
    } else {
      numCores = 1;
    }

    logger.info(
      `O Serviço irá iniciar em modo cluster com ${numCores} worker(s)`,
      { workers: numCores }
    );

    for (let i = 0; i < numCores; i++) {
      let newCluster = cluster.fork();

      newCluster.on("message", function(message) {
        logger.info(`Worker message: ${message}`, { message });
      });
    }
    cluster.on("online", function(worker) {
      logger.info(`Worker ${worker.process.pid} iniciado`, {
        worker_pid: worker.process.pid
      });
    });
    cluster.on("exit", function(worker, code, signal) {
      logger.error(
        `Worker ${worker.process.pid} morreu com código ${code} e sinal ${signal}`,
        {
          worker_pid: worker.process.pid,
          code,
          signal
        }
      );
    });
  }
};

module.exports = { setupWorkerProcesses, isMaster: cluster.isMaster };
