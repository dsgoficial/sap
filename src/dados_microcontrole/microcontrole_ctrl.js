/*
const uuid = require('uuid/v1');
  
const settings = require('../config.json')
const promise = require('bluebird')
const options = {
  promiseLib: promise
}

const pgp = require('pg-promise')(options)
const db = pgp(settings.connectionStringControle)
const db_acervo = pgp(settings.connectionStringAcervo)

//https://github.com/vitaly-t/pg-promise/wiki/Robust-Listeners
let connection; // global connection for permanent event listeners

function onNotification(data) {
  let payload = JSON.parse(data.payload)

  if(payload.tipo === 'dados'){
    if(payload.operacao === 'INSERT' || payload.operacao === 'UPDATE'){
      if(payload.medida === ''){
        payload.medida = null
      }
      if(payload.vertices === ''){
        payload.vertices = null
      }        
      db.none('INSERT INTO microcontrole.dados(uuid,data,operacao,usuario,classe,database,comprimento,vertices)' +
             ' VALUES($1,$2,$3,$4,$5,$6,$7,$8)', 
            [payload.uuid, payload.data, payload.operacao, payload.usuario, payload.classe,
              payload.database, payload.medida, payload.vertices])
      .then(function () {
        return true;
      }).catch(function (err){
        console.log(err)
      })
    }
    if(payload.operacao === 'DELETE'){
      db.none('DELETE FROM microcontrole.dados WHERE uuid =$1;' + 
             ' INSERT INTO microcontrole.dados(uuid,data,operacao,usuario,classe,database)' +
             ' VALUES($1,NOW(),$2,$3,$4,$5)', 
            [payload.uuid, payload.operacao, payload.usuario, payload.classe, payload.database])
      .then(function () {
        return true;
      }).catch(function (err){
        console.log(err)
      })
    }
  }
  if(payload.tipo === 'grade' && payload.geom && payload.geom != ''){
    db.none('UPDATE microcontrole.prod_grade_controle_a SET controle = NOW()' +
            ' WHERE categoria = $1 and st_intersects(geom,ST_GeomFromEWKT($2))', 
          [payload.categoria, payload.geom])
    .then(function () {
    return true;
    }).catch(function (err){
      console.log(err)
    })      
  }

}

function setListeners(client) {
  client.on('notification', onNotification);
  return connection.none('LISTEN $1~', 'microcontrole')
      .catch(error => {
          console.log(error); // unlikely to ever happen
      });
}

function removeListeners(client) {
  client.removeListener('notification', onNotification);
}

function onConnectionLost(err, e) {
  console.log('Connectivity Problem:', err);
  connection = null; // prevent use of the broken connection
  removeListeners(e.client);
  reconnect(5000, 10) // retry 10 times, with 5-second intervals
      .then(() => {
          console.log('Successfully Reconnected');
      })
      .catch(() => {
          // failed after 10 attempts
          console.log('Connection Lost Permanently');
      });
}

function reconnect(delay, maxAttempts) {
  delay = delay > 0 ? parseInt(delay) : 0;
  maxAttempts = maxAttempts > 0 ? parseInt(maxAttempts) : 1;
  return new Promise((resolve, reject) => {
      setTimeout(() => {
          db.connect({direct: true, onLost: onConnectionLost})
              .then(obj => {
                  connection = obj; // global connection is now available
                  resolve(obj);
                  return setListeners(obj.client);
              })
              .catch(error => {
                  console.log('Error Connecting:', error);
                  if (--maxAttempts) {
                      reconnect(delay, maxAttempts)
                          .then(resolve)
                          .catch(reject);
                  } else {
                      reject(error);
                  }
              });
      }, delay);
  });
}

reconnect() // = same as reconnect(0, 1)
  .then(obj => {
      console.log('Successful Initial Connection');
      // obj.done(); - releases the connection
  })
  .catch(error => {
      console.log('Failed Initial Connection:', error);
  });

if (!Date.prototype.toISODate) {
  (function() {

    function pad(number) {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    }

    Date.prototype.toISODate = function() {
      return this.getUTCFullYear() +
        '-' + pad(this.getUTCMonth() + 1) +
        '-' + pad(this.getUTCDate())
    };

  }());
}

if (!Date.prototype.getWeek) {
  (function() {
    const today = new Date();
    const onejan = new Date(today.getFullYear(),0,1);

    Date.prototype.getWeek = function() {
      return Math.ceil(((this-onejan)/86400000 + onejan.getDay()+1)/7);
    };

  }());
}

function getHorasTrabalhadas(req,res,next){
  const fim;
  const inicio;
  db.any('SELECT DISTINCT ON (data::date, usuario) data::date as dia, data, usuario FROM microcontrole.dados where data > current_date - interval \'12\' day ORDER BY usuario, data::date DESC, data DESC;')
    .then(function (data) {
      fim = data
      return db.any('SELECT DISTINCT ON (data::date, usuario) data::date as dia, data, usuario FROM microcontrole.dados where data > current_date - interval \'12\' day ORDER BY usuario, data::date DESC, data;')
    })
    .then(function (data) {
      inicio = data
      const horasTrabalhadas = {}

      fim.forEach(function(d){
        if(!(d.usuario in horasTrabalhadas)){
          horasTrabalhadas[d.usuario] = {}
        }

        const dataParsed = d.dia.toISODate();

        if(!(dataParsed in horasTrabalhadas[d.usuario])){
          horasTrabalhadas[d.usuario][dataParsed] = {}
        }

        horasTrabalhadas[d.usuario][dataParsed].fim = d.data;
      })

      inicio.forEach(function(d){
        if(!(d.usuario in horasTrabalhadas)){
          horasTrabalhadas[d.usuario] = {}
        }

        const dataParsed = d.dia.toISODate();

        if(!(dataParsed in horasTrabalhadas[d.usuario])){
          horasTrabalhadas[d.usuario][dataParsed] = {}
        }

        horasTrabalhadas[d.usuario][dataParsed].inicio = d.data;
      })  

      return res.status(200).json(horasTrabalhadas)
    })
    .catch(function (err) {
      return next(err)
    })    
}

function getProdClassesSem(req,res,next,classes){
  const classStr = classes.join(',')
  const dataCount
  const dataProd
  db.any('select usuario, data::date, operacao, count(*) from microcontrole.dados where classe = ANY(\'{' + classStr + '}\'::constchar[]) AND data > current_date - interval \'366\' day group by usuario' + 
          ', data::date, operacao order by usuario')
    .then(function (data) {
      dataCount = data
      return db.any('select usuario, data::date, sum(comprimento) as comprimento, sum(vertices) as vertices from microcontrole.dados where ' +
                  ' classe = ANY(\'{' + classStr + '}\'::constchar[]) AND data > current_date - interval \'366\' day and operacao = \'INSERT\' group by usuario, data::date')
    })
    .then(function (data) {
      dataProd = data
      const producao = {}
      dataProd.forEach(function(d){
        if(!(d.usuario in producao)){
          producao[d.usuario] = {}
        }

        const dataParsed = d.data.getWeek();

        if(!(dataParsed in producao[d.usuario])){
          producao[d.usuario][dataParsed] = {}
        }
        if(!('comprimento' in producao[d.usuario][dataParsed])){
          producao[d.usuario][dataParsed].comprimento = 0
        }

        producao[d.usuario][dataParsed].comprimento += parseFloat(d.comprimento);          

      })

      dataCount.forEach(function(d){
        if(!(d.usuario in producao)){
          producao[d.usuario] = {}
        }
        const dataParsed = d.data.getWeek();
        if(!(dataParsed in producao[d.usuario])){
          producao[d.usuario][dataParsed] = {}
        }
        if(!('insertCount' in producao[d.usuario][dataParsed])){
          producao[d.usuario][dataParsed].insertCount = 0
        }
        if(d.operacao === 'INSERT'){
          producao[d.usuario][dataParsed].insertCount += parseInt(d.count);
        }
      })
      return res.status(200).json(producao)
    })
    .catch(function (err) {
      return next(err)
    })
}

function getProdClasses(req,res,next,classes){
  const classStr = classes.join(',')
  const dataCount
  const dataProd
  db.any('select usuario, data::date, operacao, count(*) from microcontrole.dados where classe = ANY(\'{' + classStr + '}\'::constchar[]) AND data > current_date - interval \'12\' day group by usuario' + 
          ', data::date, operacao order by usuario')
    .then(function (data) {
      dataCount = data
      return db.any('select usuario, data::date, sum(comprimento) as comprimento, sum(vertices) as vertices from microcontrole.dados where ' +
                  'classe = ANY(\'{' + classStr + '}\'::constchar[]) AND data > current_date - interval \'12\' day and operacao = \'INSERT\' group by usuario, data::date')
    })
    .then(function (data) {
      dataProd = data
      const producao = {}
      dataProd.forEach(function(d){
        if(!(d.usuario in producao)){
          producao[d.usuario] = {}
        }

        const dataParsed = d.data.toISODate();

        if(!(dataParsed in producao[d.usuario])){
          producao[d.usuario][dataParsed] = {}
        }

        producao[d.usuario][dataParsed].comprimento = d.comprimento;
        producao[d.usuario][dataParsed].vertices = d.vertices;
        

      })

      dataCount.forEach(function(d){
        if(!(d.usuario in producao)){
          producao[d.usuario] = {}
        }
        const dataParsed = d.data.toISODate();
        if(!(dataParsed in producao[d.usuario])){
          producao[d.usuario][dataParsed] = {}
        }
        if(d.operacao === 'INSERT'){
          producao[d.usuario][dataParsed].insertCount = d.count;
        }
        if(d.operacao === 'UPDATE'){
          producao[d.usuario][dataParsed].updateCount = d.count;
        }        
        if(d.operacao === 'DELETE'){
          producao[d.usuario][dataParsed].deleteCount = d.count;
        }
      })
      return res.status(200).json(producao)
    })
    .catch(function (err) {
      return next(err)
    })
}

function getOperadoresDia(req,res,next){
  db.any('select distinct usuario, database from microcontrole.dados where data >= now()::date order by usuario')
    .then(function (data) {
      return res.status(200).json(data)
    })
    .catch(function (err) {
      return next(err)
    })
}

//------------------------------------------------------------------------------



function getGridVeg(req,res,next,categoria){

  const grids = {}
  db.any('select u.nome_guerra as operador, ut.nome as unidade_trabalho from macrocontrole.execucao_etapa as ee ' + 
  ' INNER JOIN macrocontrole.unidade_trabalho AS ut ON ut.id = ee.unidade_trabalho_id' +
  ' LEFT JOIN macrocontrole.usuario AS u ON u.id = ee.operador_atual' +
  ' where ee.data_inicio is not null and ee.data_fim is null, ee.etapa_subfase_id = $1', [categoria])
    .then(function (listUt) {
      db.task(function (t) {
        const batch = []
        listaUt.forEach(function(lista){
          batch.push(t.any('SELECT row, col, controle FROM microcontrole.prod_grade_controle_a where categoria = $1 and unidade_trabalho = $2', [categoria, lista.unidade_trabalho]))
        })      
        return t.batch(batch)
      }).then(function (data) {
        listaUt.forEach(function(lista, i){
          data[i].operador = lista.operador;
          grids[lista.unidade_trabalho] = data[i]
        })
        return res.status(200).json(grids)
      })
  }).catch(function(err){
    console.log(err)
  })
}
*/