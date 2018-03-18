'use strict';

/*
function generateMetadata(req,res,next,projeto,mi,tipo){
    
    const query = {}    
    query['ram_50k'] = 'SELECT inom, nome, aquisicao, validacao, edicao, area_continua, data_imagem, data_reambulacao, data_processamento FROM producao.ram_50k where mi = $1'
    
    query['sc_25k'] = 'SELECT inom, nome, aquisicao, reambulacao, validacao, edicao, area_continua, data_imagem FROM producao.sc_25k where mi = $1'
    
    query['ci_25k'] = 'SELECT inom, nome, levantamento_auditoria, aerotriangulacao, restituicao, aquisicao, reambulacao, validacao, edicao, area_continua, data_imagem FROM producao.ci_25k where mi = $1'


    const palavra_chave_query = 'SELECT nome, tipo FROM auxiliar.palavra_chave where mi = $1 and projeto = $2'

    const xmlTemplate = {}
    xmlTemplate.vetorial = {}
    xmlTemplate.vetorial['ram_50k'] = 'template_ram_vetorial.xml'
    xmlTemplate.vetorial['sc_25k'] = 'template_sc25k_vetorial.xml'
    xmlTemplate.vetorial['ci_25k'] = 'template_ci25k_vetorial.xml'

    xmlTemplate.matricial = {}
    xmlTemplate.matricial['ram_50k'] = 'template_ram_matricial.xml'
    xmlTemplate.matricial['sc_25k'] = 'template_sc25k_matricial.xml'
    xmlTemplate.matricial['ci_25k'] = 'template_ci25k_matricial.xml'
    
    const dados = {}
    
    db_acervo.task(function (t) {
      const batch = []
      batch.push(t.oneOrNone(query[projeto], [mi]))
      batch.push(t.any(palavra_chave_query, [mi, projeto]))
      return t.batch(batch)
    }).then(function (data) {
      if(!data[0]){
        //mi não existe
        return next()
      }
      const d = new Date();
      const data_metadado = d.toISOString().split("T")[0];

      if(projeto === "ram_50k"){
        const dados = {
          uuid: uuid(),
          data_metadado: data_metadado,
          nome: data[0].nome,
          inom: data[0].inom,
          data_preparo: data[0].data_processamento.toISOString().split("T")[0],
          data_digitalizacao: data[0].aquisicao.toISOString().split("T")[0],
          data_validacao: data[0].validacao.toISOString().split("T")[0],
          data_area_continua: data[0].area_continua.toISOString().split("T")[0],
          data_edicao: data[0].edicao.toISOString().split("T")[0],
          palavras_chave: data[1]
        }

        dados.data_produto = dados.data_area_continua;

        if(data[0].data_reambulacao){
          dados.data_reambulacao = data[0].data_reambulacao.toISOString().split("T")[0];
          dados.data_conclusao = dados.data_reambulacao
        } else {
          dados.data_conclusao = data[0].data_imagem.toISOString().split("T")[0];      
        }
      }

      if(projeto === "sc_25k"){
        const dados = {
          uuid: uuid(),
          data_metadado: data_metadado,
          nome: data[0].nome,
          inom: data[0].inom,
          data_digitalizacao: data[0].aquisicao.toISOString().split("T")[0],
          data_reambulacao: data[0].reambulacao.toISOString().split("T")[0],         
          data_validacao: data[0].validacao.toISOString().split("T")[0],
          data_area_continua: data[0].area_continua.toISOString().split("T")[0],
          data_edicao: data[0].edicao.toISOString().split("T")[0],
          data_conclusao: data[0].reambulacao.toISOString().split("T")[0], 
          data_produto: data[0].area_continua.toISOString().split("T")[0],
          palavras_chave: data[1]
        }
      }

      if(projeto === "ci_25k"){
        const dados = {
          uuid: uuid(),
          data_metadado: data_metadado,
          nome: data[0].nome,
          inom: data[0].inom,
          data_levantamento: data[0].levantamento_auditoria.toISOString().split("T")[0],
          data_aerotriangulacao: data[0].aerotriangulacao.toISOString().split("T")[0],
          data_restituicao: data[0].restituicao.toISOString().split("T")[0],
          data_digitalizacao: data[0].aquisicao.toISOString().split("T")[0],
          data_reambulacao: data[0].reambulacao.toISOString().split("T")[0],         
          data_validacao: data[0].validacao.toISOString().split("T")[0],
          data_area_continua: data[0].area_continua.toISOString().split("T")[0],
          data_edicao: data[0].edicao.toISOString().split("T")[0],
          data_conclusao: data[0].reambulacao.toISOString().split("T")[0], 
          data_produto: data[0].area_continua.toISOString().split("T")[0],
          palavras_chave: data[1]
        }
      }

      res.set('Content-Type', 'application/xml');
      return res.render(xmlTemplate[tipo][projeto], dados);      
    }).catch(function(err){
      console.log(err)
      res.status(404).json({
        descricao: "Não encontrado"
      })
    })
  }

  module.exports.generateMetadata = generateMetadata;

  */