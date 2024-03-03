'use strict'

//  const nunjucks = require('nunjucks')

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getTipoPalavraChave = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.tipo_palavra_chave')
}

controller.getOrganizacao = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.organizacao')
}

controller.getEspecificacao = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.especificacao')
}

controller.getDatumVertical = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.datum_vertical')
}

controller.getCodigoRestricao = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.codigo_restricao')
}

controller.getCodigoClassificacao = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.codigo_classificacao')
}

controller.getUsuarios = async () => {
  return db.sapConn.any(
    `SELECT u.id, u.usuario_sap_id, u.nome, u.funcao, u.organizacao_id,
    o.nome AS organizacao
    FROM metadado.usuario AS u
    INNER JOIN metadado.organizacao AS o
    ON o.code = u.organizacao_id`
  )
}

controller.gravaUsuarios = async usuario => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'usuario_sap_id',
      'nome',
      'funcao',
      'organizacao_id'
    ])

    const query = db.pgp.helpers.insert(usuario, cs, {
      table: 'usuario',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaUsuarios = async (usuario) => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'usuario_sap_id',
      'nome',
      'funcao',
      'organizacao_id'
    ])

    const query =
      db.pgp.helpers.update(
        usuario,
        cs,
        { table: 'usuario', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaUsuarios = async usuariosIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.usuario
      WHERE id in ($<usuariosIds:csv>)`,
      { usuariosIds }
    )
    if (exists && exists.length < usuariosIds.length) {
      throw new AppError(
        'O id informado não corresponde a um metadado de usuário',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.usuario
      WHERE id in ($<usuariosIds:csv>)`,
      { usuariosIds }
    )
  })
}

controller.getInformacoesProduto = async () => {
  return db.sapConn.any(
    `SELECT ip.id, ip.produto_id, ip.resumo, ip.proposito, ip.creditos, ip.informacoes_complementares,
    ip.declaracao_linhagem, ip.projeto_bdgex, ip.limitacao_acesso_id, cr1.nome AS limitacao_acesso,
    ip.limitacao_uso_id, cr2.nome AS limitacao_uso, ip.restricao_uso_id, cr3.nome AS restricao_uso,
    ip.grau_sigilo_id, cc.nome AS grau_sigilo, ip.organizacao_responsavel_id, o1.nome AS organizacao_responsavel,
    ip.organizacao_distribuicao_id, o2.nome AS organizacao_distribuicao, ip.datum_vertical_id, dv.nome AS datum_vertical,
    ip.especificacao_id, e.nome AS especificacao, ip.responsavel_produto_id, u.nome AS responsavel_produto
    FROM metadado.informacoes_produto AS ip
    INNER JOIN metadado.codigo_restricao AS cr1 ON cr1.code = ip.limitacao_acesso_id
    INNER JOIN metadado.codigo_restricao AS cr2 ON cr2.code = ip.limitacao_uso_id
    INNER JOIN metadado.codigo_restricao AS cr3 ON cr3.code = ip.restricao_uso_id
    INNER JOIN metadado.codigo_classificacao AS cc ON cc.code = ip.grau_sigilo_id
    INNER JOIN metadado.organizacao AS o1 ON o1.code = ip.organizacao_responsavel_id
    INNER JOIN metadado.organizacao AS o2 ON o2.code = ip.organizacao_distribuicao_id
    INNER JOIN metadado.datum_vertical AS dv ON dv.code = ip.datum_vertical_id
    INNER JOIN metadado.especificacao AS e ON e.code = ip.especificacao_id
    INNER JOIN metadado.usuario AS u ON u.id = ip.responsavel_produto_id
    `
  )
}

controller.gravaInformacoesProduto = async informacoes => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'produto_id',
      'resumo',
      'proposito',
      'creditos',
      'informacoes_complementares',
      'limitacao_acesso_id',
      'limitacao_uso_id',
      'restricao_uso_id',
      'grau_sigilo_id',
      'organizacao_responsavel_id',
      'organizacao_distribuicao_id',
      'datum_vertical_id',
      'especificacao_id',
      'responsavel_produto_id',
      'declaracao_linhagem',
      'projeto_bdgex'
    ])

    const query = db.pgp.helpers.insert(informacoes, cs, {
      table: 'informacoes_produto',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaInformacoesProduto = async informacoes => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'produto_id',
      'resumo',
      'proposito',
      'creditos',
      'informacoes_complementares',
      'limitacao_acesso_id',
      'limitacao_uso_id',
      'restricao_uso_id',
      'grau_sigilo_id',
      'organizacao_responsavel_id',
      'organizacao_distribuicao_id',
      'datum_vertical_id',
      'especificacao_id',
      'responsavel_produto_id',
      'declaracao_linhagem',
      'projeto_bdgex'
    ])

    const query =
      db.pgp.helpers.update(
        informacoes,
        cs,
        { table: 'informacoes_produto', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaInformacoesProduto = async informacoesIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.informacoes_produto
      WHERE id in ($<informacoesIds:csv>)`,
      { informacoesIds }
    )
    if (exists && exists.length < informacoesIds.length) {
      throw new AppError(
        'O id informado não corresponde a um metadado de informações de produto',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.informacoes_produto
      WHERE id in ($<informacoesIds:csv>)`,
      { informacoesIds }
    )
  })
}

controller.getResponsavelFaseProduto = async () => {
  return db.sapConn.any(
    `SELECT rfp.id, rfp.usuario_id, rfp.fase_id, rfp.produto_id,
    p.nome AS produto, p.inom, p.denominador_escala, p.tipo_produto_id, p.lote_id,
    l.nome AS lote, l.projeto_id, proj.nome AS projeto, proj.finalizado AS projeto_finalizado,
    tp.nome AS tipo_produto,
    u.nome, u.funcao,
    f.tipo_fase_id, tf.nome AS tipo_fase,
    f.linha_producao_id, lp.nome AS AS linha_producao
    FROM metadado.responsavel_fase_produto AS rfp
    INNER JOIN macrocontrole.produto AS p ON p.id = rfp.produto_id
    INNER JOIN metadado.usuario AS u ON u.id = rfp.usuario_id
    INNER JOIN macrocontrole.fase AS f ON f.id = rfp.fase_id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id
    INNER JOIN macrocontrole.projeto AS proj ON proj.id = l.projeto_id
    INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id
    `
  )
}

controller.gravaResponsavelFaseProduto = async responsavelFaseProduto => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'usuario_id',
      'fase_id',
      'produto_id'
    ])

    const query = db.pgp.helpers.insert(responsavelFaseProduto, cs, {
      table: 'responsavel_fase_produto',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaResponsavelFaseProduto = async responsavelFaseProduto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'usuario_id',
      'fase_id',
      'produto_id'
    ])

    const query =
      db.pgp.helpers.update(
        responsavelFaseProduto,
        cs,
        { table: 'responsavel_fase_produto', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deletaResponsavelFaseProduto = async responsavelFaseProdutoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.responsavel_fase_produto
      WHERE id in ($<responsavelFaseProdutoIds:csv>)`,
      { responsavelFaseProdutoIds }
    )
    if (exists && exists.length < responsavelFaseProdutoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um metadado de usuário',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.responsavel_fase_produto
      WHERE id in ($<responsavelFaseProdutoIds:csv>)`,
      { responsavelFaseProdutoIds }
    )
  })
}

controller.getPalavraChaveProduto = async (produtos) => {
  if (produtos) {
    let produtos_csv = produtos.split(',')
    return db.sapConn.any(
      `SELECT pcp.nome, pcp.tipo_palavra_chave_id, tpk.nome AS tipo_palavra_chave, pcp.produto_id,
      p.mi, p.inom, p.denominador_escala, p.tipo_produto_id, p.edicao, p.latitude_centro, p.longitude_centro,
      tp.nome AS tipo_produto
      FROM metadado.palavra_chave_produto AS pcp
      INNER JOIN metadado.tipo_palavra_chave AS tpk ON tpk.code = pcp.tipo_palavra_chave_id
      INNER JOIN macrocontrole.produto AS p ON p.id = pcp.produto_id
      INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id
      WHERE pcp.produto_id IN ($<produtos_csv:csv>)`,
      { produtos_csv }
    )
  } else {
    return db.sapConn.any(
      `SELECT pcp.nome, pcp.tipo_palavra_chave_id, tpk.nome AS tipo_palavra_chave, pcp.produto_id,
      p.mi, p.inom, p.denominador_escala, p.tipo_produto_id, p.edicao, p.latitude_centro, p.longitude_centro,
      tp.nome AS tipo_produto
      FROM metadado.palavra_chave_produto AS pcp
      INNER JOIN metadado.tipo_palavra_chave AS tpk ON tpk.code = pcp.tipo_palavra_chave_id
      INNER JOIN macrocontrole.produto AS p ON p.id = pcp.produto_id
      INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id`
    )
  }
}

controller.getProduto = async (produtos) => {
  if (produtos) {
    let produtos_csv = produtos.split(',')
    return db.sapConn.any(
      `SELECT p.id, p.uuid, p.nome, p.mi, p.inom, p.denominador_escala, p.tipo_produto_id, p.edicao, p.latitude_centro, p.longitude_centro,
      tp.nome AS tipo_produto
      FROM macrocontrole.produto AS p
      INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id
      WHERE p.produto_id IN ($<produtos_csv:csv>)`,
      { produtos_csv }
    )
  } else {
    return db.sapConn.any(
      `SELECT p.id, p.uuid, p.nome, p.mi, p.inom, p.denominador_escala, p.tipo_produto_id, p.edicao, p.latitude_centro, p.longitude_centro,
      tp.nome AS tipo_produto
      FROM macrocontrole.produto AS p
      INNER JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id
      `
    )
  }
}

controller.atualizaProduto = async produto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'uuid',
      'nome'
    ])

    const query =
      db.pgp.helpers.update(
        produto,
        cs,
        { table: 'produto', schema: 'macrocontrole' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.criaPalavraChaveProduto = async palavrasChaveProduto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'nome',
      'tipo_palavra_chave_id',
      'produto_id'
    ])

    const query = db.pgp.helpers.insert(palavrasChaveProduto, cs, {
      table: 'palavra_chave_produto',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaPalavraChaveProduto = async palavrasChaveProduto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      'nome',
      'tipo_palavra_chave_id',
      'produto_id'
    ])

    const query =
      db.pgp.helpers.update(
        palavrasChaveProduto,
        cs,
        { table: 'palavra_chave_produto', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deletePalavraChaveProduto = async palavrasChaveProdutoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.palavra_chave_produto
      WHERE id in ($<palavrasChaveProdutoIds:csv>)`,
      { palavrasChaveProdutoIds }
    )

    if (exists && exists.length < palavrasChaveProdutoIds.length) {
      throw new AppError(
        'O id informado não corresponde a uma palavra-chave do produto id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.palavra_chave_produto
      WHERE id in ($<palavrasChaveProdutoIds:csv>)`,
      { palavrasChaveProdutoIds }
    )
  })
}

controller.getCreditosQpt = async () => {
  return db.sapConn.any(
    `SELECT id, nome, qpt FROM metadado.creditos_qpt`
  )
}

controller.criaCreditosQpt = async creditosQpt => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['nome', 'qpt'])

    const query = db.pgp.helpers.insert(creditosQpt, cs, {
      table: 'creditos_qpt',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaCreditosQpt = async creditosQpt => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['id', 'nome', 'qpt'])

    const query =
      db.pgp.helpers.update(
        creditosQpt,
        cs,
        { table: 'creditos_qpt', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deleteCreditosQpt = async creditosQptIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.creditos_qpt
      WHERE id in ($<creditosQptIds:csv>)`,
      { creditosQptIds }
    )

    if (exists && exists.length < creditosQptIds.length) {
      throw new AppError(
        'O id informado não corresponde a um crédito QPT id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.creditos_qpt
      WHERE id in ($<creditosQptIds:csv>)`,
      { creditosQptIds }
    )
  })
}

controller.getInformacoesEdicao = async () => {
  return db.sapConn.any(
    `SELECT ie.pec_planimetrico, ie.pec_altimetrico, ie.origem_dados_altimetricos, ie.territorio_internacional,
    ie.acesso_restrito, ie.carta_militar, ie.data_criacao, ie.epsg_mde, ie.caminho_mde, ie.dados_terceiro,
    ie.quadro_fases, ie.creditos_id, cq.nome AS nome_creditos_qpt, cq.qpt AS creditos_qpt,
    ie.produto_id, p.nome, p.mi, p.inom, p.denominador_escala, p.edicao
    FROM metadado.informacoes_edicao AS ie
    INNER JOIN metadado.creditos_qpt AS cq ON cq.id = ie.creditos_id
    INNER JOIN macrocontrole.produto AS p ON p.id = ie.produto_id`
  )
}

controller.criaInformacoesEdicao = async informacoesEdicao => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'produto_id', 'pec_planimetrico', 'pec_altimetrico', 
      'origem_dados_altimetricos', 'territorio_internacional', 
      'acesso_restrito', 'carta_militar', 'data_criacao', 
      'creditos_id', 'epsg_mde', 'caminho_mde', 'dados_terceiro',
      'quadro_fases'
    ])

    const query = db.pgp.helpers.insert(informacoesEdicao, cs, {
      table: 'informacoes_edicao',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaInformacoesEdicao = async informacoesEdicao => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', 'produto_id', 'pec_planimetrico', 'pec_altimetrico', 
      'origem_dados_altimetricos', 'territorio_internacional', 
      'acesso_restrito', 'carta_militar', 'data_criacao', 
      'creditos_id', 'epsg_mde', 'caminho_mde', 'dados_terceiro',
      'quadro_fases'
    ])

    const query =
      db.pgp.helpers.update(
        informacoesEdicao,
        cs,
        { table: 'informacoes_edicao', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deleteInformacoesEdicao = async informacoesEdicaoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.informacoes_edicao
      WHERE id in ($<informacoesEdicaoIds:csv>)`,
      { informacoesEdicaoIds }
    )

    if (exists && exists.length < informacoesEdicaoIds.length) {
      throw new AppError(
        'O id informado não corresponde a uma informação de edição id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.informacoes_edicao
      WHERE id in ($<informacoesEdicaoIds:csv>)`,
      { informacoesEdicaoIds }
    )
  })
}

controller.getImagensCartaOrtoimagem = async () => {
  return db.sapConn.any(
    `SELECT ico.produto_id, ico.caminho_imagem, ico.caminho_estilo, ico.epsg,
    ico.produto_id, p.nome, p.mi, p.inom, p.denominador_escala, p.edicao
    FROM metadado.imagens_carta_ortoimagem AS ico
    INNER JOIN macrocontrole.produto AS p ON p.id = ico.produto_id`
  )
}

controller.criaImagensCartaOrtoimagem = async imagensCartaOrtoimagem => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'produto_id', 'caminho_imagem', 'caminho_estilo', 'epsg'
    ])

    const query = db.pgp.helpers.insert(imagensCartaOrtoimagem, cs, {
      table: 'imagens_carta_ortoimagem',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaImagensCartaOrtoimagem = async imagensCartaOrtoimagem => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', 'produto_id', 'caminho_imagem', 'caminho_estilo', 'epsg'
    ])

    const query =
      db.pgp.helpers.update(
        imagensCartaOrtoimagem,
        cs,
        { table: 'imagens_carta_ortoimagem', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deleteImagensCartaOrtoimagem = async imagensCartaOrtoimagemIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.imagens_carta_ortoimagem
      WHERE id in ($<imagensCartaOrtoimagemIds:csv>)`,
      { imagensCartaOrtoimagemIds }
    )

    if (exists && exists.length < imagensCartaOrtoimagemIds.length) {
      throw new AppError(
        'O id informado não corresponde a uma imagem da carta ortoimagem id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.imagens_carta_ortoimagem
      WHERE id in ($<imagensCartaOrtoimagemIds:csv>)`,
      { imagensCartaOrtoimagemIds }
    )
  })
}

controller.getClassesComplementaresOrto = async () => {
  return db.sapConn.any(
    `SELECT id, nome, classes FROM metadado.classes_complementares_orto`
  )
}

controller.criaClassesComplementaresOrto = async classesComplementaresOrto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['nome', 'classes'])

    const query = db.pgp.helpers.insert(classesComplementaresOrto, cs, {
      table: 'classes_complementares_orto',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaClassesComplementaresOrto = async classesComplementaresOrto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['id', 'nome', 'classes'])

    const query =
      db.pgp.helpers.update(
        classesComplementaresOrto,
        cs,
        { table: 'classes_complementares_orto', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deleteClassesComplementaresOrto = async classesComplementaresOrtoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.classes_complementares_orto
      WHERE id in ($<classesComplementaresOrtoIds:csv>)`,
      { classesComplementaresOrtoIds }
    )

    if (exists && exists.length < classesComplementaresOrtoIds.length) {
      throw new AppError(
        'O id informado não corresponde a uma classe complementar orto id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.classes_complementares_orto
      WHERE id in ($<classesComplementaresOrtoIds:csv>)`,
      { classesComplementaresOrtoIds }
    )
  })
}

controller.getPerfilClassesComplementaresOrto = async () => {
  return db.sapConn.any(
    `SELECT pcco.id, pcco.produto_id, p.nome, p.mi, p.inom, p.denominador_escala, p.edicao,
    pcco.classes_complementares_orto_id, pcco.nome, pcco.classes
    FROM metadado.perfil_classes_complementares_orto AS pcco
    INNER JOIN macrocontrole.produto AS p ON p.id = pcco.produto_id
    INNER JOIN macrocontrole.classes_complementares_orto AS cco ON cco.id = pcco.classes_complementares_orto_id`
  )
}

controller.criaPerfilClassesComplementaresOrto = async perfilClassesComplementaresOrto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['produto_id', 'classes_complementares_orto_id'])

    const query = db.pgp.helpers.insert(perfilClassesComplementaresOrto, cs, {
      table: 'perfil_classes_complementares_orto',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilClassesComplementaresOrto = async perfilClassesComplementaresOrto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['id', 'produto_id', 'classes_complementares_orto_id'])

    const query =
      db.pgp.helpers.update(
        perfilClassesComplementaresOrto,
        cs,
        { table: 'perfil_classes_complementares_orto', schema: 'metadado' },
        {
          tableAlias: 'X',
          valueAlias: 'Y'
        }
      ) + 'WHERE Y.id = X.id'

    await t.none(query)
  })
}

controller.deletePerfilClassesComplementaresOrto = async perfilClassesComplementaresOrtoIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.perfil_classes_complementares_orto
      WHERE id in ($<perfilClassesComplementaresOrtoIds:csv>)`,
      { perfilClassesComplementaresOrtoIds }
    )

    if (exists && exists.length < perfilClassesComplementaresOrtoIds.length) {
      throw new AppError(
        'O id informado não corresponde a um perfil de classe complementar orto id',
        httpCode.BadRequest
      )
    }

    return t.any(
      `DELETE FROM metadado.perfil_classes_complementares_orto
      WHERE id in ($<perfilClassesComplementaresOrtoIds:csv>)`,
      { perfilClassesComplementaresOrtoIds }
    )
  })
}

/*
const xmlTemplate = {}

xmlTemplate['1'] = 'template_carta_topo_vetorial.xml'
xmlTemplate['2'] = 'template_carta_topo_matricial.xml'
xmlTemplate['3'] = 'template_carta_ortoimagem.xml'
xmlTemplate['4'] = 'template_ortoimagem.xml'
xmlTemplate['5'] = 'template_mds.xml'
xmlTemplate['6'] = 'template_mdt.xml'
xmlTemplate['7'] = 'template_carta_tematica.xml'

controller.getMetadado = async uuid => {
  return db.sapConn.task(async t => {
    const produto = await t.oneOrNone(
      `SELECT p.nome, p.mi, p.inom, p.escala, p.geometry, lp.tipo_produto_id,
      proj.nome AS projeto, ip.resumo, ip.proposito, ip.creditos, ip.informacoes_complementares,
      ip.limitacao_acesso_id, ip.restricao_uso_id, ip.grau_sigilo_id, ip.organizacao_responsavel_id,
      ip.organizacao_distribuicao_id, ip.datum_vertical_id, ip.especificacao_id, ip.declaracao_linhagem
      FROM macrocontrole.produto AS p
      INNER JOIN macrocontrole.lote AS l ON l.id = p.lote_id
      INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = p.linha_producao_id
      INNER JOIN macrocontrole.projeto AS proj ON l.projeto_id = proj.id
      INNER JOIN metadado.informacoes_produto AS ip ON ip.lote_id = l.id
      WHERE p.uuid = $1`,
      [uuid]
    )
    if (!produto) {
      throw new AppError(
        'Erro ao retornar metadados. Produto não encontrado',
        httpCode.BadRequest
      )
    }

    const producao = await t.any(
      `SELECT ut.fase_id,
      (CASE WHEN min(ut.unidade_trabalho_id) IS NOT NULL min(ut.data_inicio) ELSE '-' END) AS data_inicio,
      (CASE WHEN min(ut.unidade_trabalho_id) IS NOT NULL (CASE WHEN count(*) - count(ut.data_fim) = 0 THEN max(ut.data_fim) ELSE NULL END) ELSE '-' END) AS data_fim
      FROM macrocontrole.produto AS p
      LEFT JOIN 
      (
        SELECT s.fase_id, ut.geom, min(a.data_inicio) as data_inicio,
        (CASE WHEN count(*) - count(a.data_fim) = 0 THEN max(a.data_fim) ELSE NULL END) AS data_fim
        FROM macrocontrole.unidade_trabalho AS ut
        INNER JOIN macrocontrole.subfase AS s ON s.id = ut.subfase_id
        INNER JOIN
        (select unidade_trabalho_id, data_inicio, data_fim from macrocontrole.atividade where tipo_situacao_id IN (1,2,3,4)) AS a
        ON a.unidade_trabalho_id = ut.id
        GROUP BY ut.id, s.fase_id
      ) AS ut
      ON st_relate(ut.geom, p.geom, ''T********'')
      WHERE p.uuid = $1 GROUP BY p.id, ut.fase_id;
      `,
      [uuid]
    )

    const finalizado = producao.every(v => {
      return v.data_fim
    })
    if (!finalizado) {
      throw new AppError(
        'Erro ao retornar metadados. Produto não está finalizado',
        httpCode.BadRequest
      )
    }

    const palavrasChave = await db.sapConn.any(
      `SELECT pc.nome AS palavra_chave, tpc.nome AS tipo_palavra_chave
      FROM metadado.palavra_chave AS pc
      INNER JOIN metadado.tipo_palavra_chave_id AS tpc ON tpc.code = pc.tipo_palavra_chave_id
      INNER JOIN macrocontrole.produto AS p ON p.id = pc.produto_id
      WHERE p.uuid = $1`,
      [uuid]
    )

    const template = xmlTemplate[produto.tipo_produto_id]

    const dados = produto
    const d = new Date()
    dados.data_metadado = d.toISOString().split('T')[0]
    dados.palavras_chave = palavrasChave

    // responsavel metadado
    // documento linhagem
    // insumo interno
    // informacoes de producao nivel fase
    // responsavel cada fase
    // metodologias

    return template.render(dados)
  })
}
*/
module.exports = controller
