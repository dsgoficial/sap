/*
  function getRtm(req,res,next){
    var rtm = {}
    db_acervo.task(function (t) {
      var batch = []
      batch.push(t.any('SELECT mi, inom, nome, bloco, levantamento_auditoria, aerotriangulacao, restituicao, aquisicao, reambulacao, validacao, edicao, area_continua, bdgex_matricial, bdgex_vetorial FROM producao.ci_25k  ORDER BY mi'))
      batch.push(t.any('SELECT mi, inom, nome, vetorizacao, validacao, area_continua, bdgex_vetorial FROM producao.pcad_50k  ORDER BY mi'))
      batch.push(t.any('SELECT mi, inom, bloco, nome, aquisicao, validacao, edicao, area_continua, bdgex_matricial, bdgex_vetorial FROM producao.ram_50k  ORDER BY mi'))
      batch.push(t.any('SELECT mi, inom, nome, aquisicao, reambulacao, complementacao, validacao, edicao, area_continua, bdgex_matricial, bdgex_vetorial FROM producao.sc_25k ORDER BY mi'))
      return t.batch(batch)
    }).then(function (data) {
      rtm.ci25k = data[0];
      rtm.pcad50k = data[1];
      rtm.ram50k = data[2];
      rtm.sc25k = data[3];
      return res.status(200).json(rtm)
    })
  }

*/