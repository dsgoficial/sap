'use strict'

// Geracao de XML de metadados por substituicao de texto nos templates MGB
// (nao usa motor de template: os placeholders sao escalares).
const fs = require('fs')
const path = require('path')

const { db } = require('../database')

const { AppError, httpCode } = require('../utils')

const controller = {}

controller.getTipoPalavraChave = async () => {
  return db.sapConn
    .any('SELECT code, nome FROM metadado.tipo_palavra_chave')
}

controller.getOrganizacao = async () => {
  return db.sapConn
    .any('SELECT code, nome, sigla, endereco, telefone, site FROM metadado.organizacao ORDER BY code')
}

// edita os dados de contato do orgao (nome/sigla/endereco/telefone/site), usados no XML de
// metadados como produtor/distribuidor. Permite a qualquer CGEO definir o seu orgao.
controller.atualizaOrganizacao = async organizacoes => {
  return db.sapConn.tx(async t => {
    const queries = organizacoes.map(o =>
      t.none(
        `UPDATE metadado.organizacao
        SET nome = $<nome>, sigla = $<sigla>, endereco = $<endereco>, telefone = $<telefone>, site = $<site>
        WHERE code = $<code>`,
        o
      )
    )
    await t.batch(queries)
  })
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
    `SELECT ip.id, ip.produto_id, ip.lote_id, ip.resumo, ip.proposito, ip.creditos, ip.informacoes_complementares,
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
      { name: 'produto_id', def: null }, { name: 'lote_id', def: null },
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
      // cast int: no UPDATE ... FROM (VALUES) o null vira text e bate com a coluna integer
      { name: 'produto_id', def: null, cast: 'int' }, { name: 'lote_id', def: null, cast: 'int' },
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
    `SELECT rfp.id, rfp.usuario_id, rfp.fase_id, rfp.produto_id, rfp.lote_id,
    p.nome AS produto, p.inom, p.denominador_escala, p.tipo_produto_id,
    l.nome AS lote, l.projeto_id, proj.nome AS projeto, proj.status_id AS projeto_status,
    tp.nome AS tipo_produto,
    u.nome, u.funcao,
    f.tipo_fase_id, tf.nome AS tipo_fase,
    f.linha_producao_id, lp.nome AS linha_producao
    FROM metadado.responsavel_fase_produto AS rfp
    LEFT JOIN macrocontrole.produto AS p ON p.id = rfp.produto_id
    INNER JOIN metadado.usuario AS u ON u.id = rfp.usuario_id
    INNER JOIN macrocontrole.fase AS f ON f.id = rfp.fase_id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.linha_producao AS lp ON lp.id = f.linha_producao_id
    LEFT JOIN macrocontrole.lote AS l ON l.id = p.lote_id
    LEFT JOIN macrocontrole.projeto AS proj ON proj.id = l.projeto_id
    LEFT JOIN dominio.tipo_produto AS tp ON tp.code = p.tipo_produto_id
    `
  )
}

controller.gravaResponsavelFaseProduto = async responsavelFaseProduto => {
  return db.sapConn.tx(async t => {

    const cs = new db.pgp.helpers.ColumnSet([
      'usuario_id',
      'fase_id',
      { name: 'produto_id', def: null },
      { name: 'lote_id', def: null }
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
      { name: 'produto_id', def: null },
      { name: 'lote_id', def: null }
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
        'O id informado não corresponde a um responsável de fase do produto',
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

controller.getPalavraChaveProduto = async () => {
  return db.sapConn.any(
    `SELECT pcp.id, pcp.nome, pcp.tipo_palavra_chave_id, tpk.nome AS tipo_palavra_chave, pcp.produto_id
    FROM metadado.palavra_chave_produto AS pcp
    INNER JOIN metadado.tipo_palavra_chave AS tpk ON tpk.code = pcp.tipo_palavra_chave_id`
  )
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
    `SELECT ie.id, ie.pec_planimetrico, ie.pec_altimetrico, ie.origem_dados_altimetricos, ie.territorio_internacional,
    ie.acesso_restrito, ie.carta_militar, ie.data_criacao, ie.epsg_mde, ie.caminho_mde, ie.dados_terceiro,
    ie.quadro_fases, ie.tipo_produto, ie.versao_produto, ie.licenca_produto, ie.observacoes, ie.dpi,
    ie.creditos_id, cq.nome AS nome_creditos_qpt, cq.qpt AS creditos_qpt,
    ie.produto_id, ie.lote_id, p.nome, p.mi, p.inom, p.denominador_escala, p.edicao
    FROM metadado.informacoes_edicao AS ie
    LEFT JOIN metadado.creditos_qpt AS cq ON cq.id = ie.creditos_id
    LEFT JOIN macrocontrole.produto AS p ON p.id = ie.produto_id`
  )
}

controller.criaInformacoesEdicao = async informacoesEdicao => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      { name: 'produto_id', def: null }, { name: 'lote_id', def: null }, 'pec_planimetrico', 'pec_altimetrico', 
      'origem_dados_altimetricos', 'territorio_internacional', 
      'acesso_restrito', 'carta_militar', 'data_criacao', 
      { name: 'creditos_id', def: null }, 'epsg_mde', 'caminho_mde', 'dados_terceiro',
      'quadro_fases',
      { name: 'tipo_produto', def: null },
      { name: 'versao_produto', def: null },
      { name: 'licenca_produto', def: null },
      { name: 'observacoes', def: null },
      { name: 'dpi', def: 300, init: col => (col.value == null ? 300 : col.value) }
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
    // No UPDATE ... FROM (VALUES ...) o Postgres infere o tipo dos literais a
    // partir do VALUES (e null/strings viram text). Colunas nullable nao-text
    // (produto_id/lote_id INTEGER, creditos_id SMALLINT, arrays text[]) precisam
    // de cast explicito, senao da "column X is of type Y but expression is text".
    const cs = new db.pgp.helpers.ColumnSet([
      'id',
      { name: 'produto_id', def: null, cast: 'int' },
      { name: 'lote_id', def: null, cast: 'int' },
      'pec_planimetrico', 'pec_altimetrico',
      'origem_dados_altimetricos', 'territorio_internacional',
      'acesso_restrito', 'carta_militar', 'data_criacao',
      { name: 'creditos_id', def: null, cast: 'int2' },
      'epsg_mde', 'caminho_mde',
      { name: 'dados_terceiro', cast: 'text[]' },
      { name: 'quadro_fases', cast: 'json' },
      { name: 'tipo_produto', def: null },
      { name: 'versao_produto', def: null },
      { name: 'licenca_produto', def: null },
      { name: 'observacoes', def: null, cast: 'text[]' },
      { name: 'dpi', def: 300, init: col => (col.value == null ? 300 : col.value) }
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
    `SELECT ico.id, ico.produto_id, ico.lote_id, ico.caminho_imagem, ico.caminho_estilo, ico.epsg,
    p.nome, p.mi, p.inom, p.denominador_escala, p.edicao
    FROM metadado.imagens_carta_ortoimagem AS ico
    LEFT JOIN macrocontrole.produto AS p ON p.id = ico.produto_id`
  )
}

controller.criaImagensCartaOrtoimagem = async imagensCartaOrtoimagem => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      { name: 'produto_id', def: null }, { name: 'lote_id', def: null }, 'caminho_imagem', 'caminho_estilo', 'epsg'
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
      'id', { name: 'produto_id', def: null }, { name: 'lote_id', def: null }, 'caminho_imagem', 'caminho_estilo', 'epsg'
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
    `SELECT pcco.id, pcco.produto_id, pcco.lote_id, pcco.classes_complementares_orto_id,
    cco.nome, cco.classes,
    p.nome AS produto, p.mi, p.inom, p.denominador_escala, p.edicao
    FROM metadado.perfil_classes_complementares_orto AS pcco
    INNER JOIN metadado.classes_complementares_orto AS cco ON cco.id = pcco.classes_complementares_orto_id
    LEFT JOIN macrocontrole.produto AS p ON p.id = pcco.produto_id`
  )
}

controller.criaPerfilClassesComplementaresOrto = async perfilClassesComplementaresOrto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([{ name: 'produto_id', def: null }, { name: 'lote_id', def: null }, 'classes_complementares_orto_id'])

    const query = db.pgp.helpers.insert(perfilClassesComplementaresOrto, cs, {
      table: 'perfil_classes_complementares_orto',
      schema: 'metadado'
    })

    await t.none(query)
  })
}

controller.atualizaPerfilClassesComplementaresOrto = async perfilClassesComplementaresOrto => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet(['id', { name: 'produto_id', def: null }, { name: 'lote_id', def: null }, 'classes_complementares_orto_id'])

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

// ----------------------------------------------------------------------------
// Sensores da carta ortoimagem (array "sensores" do JSON de edicao)
// ----------------------------------------------------------------------------

controller.getSensorCartaOrtoimagem = async () => {
  return db.sapConn.any(
    `SELECT sco.id, sco.produto_id, sco.lote_id, sco.tipo, sco.plataforma, sco.nome,
    sco.resolucao, sco.bandas, sco.nivel_produto,
    p.nome AS produto_nome, p.mi, p.inom, p.denominador_escala, p.edicao
    FROM metadado.sensor_carta_ortoimagem AS sco
    LEFT JOIN macrocontrole.produto AS p ON p.id = sco.produto_id`
  )
}

controller.criaSensorCartaOrtoimagem = async sensores => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      { name: 'produto_id', def: null }, { name: 'lote_id', def: null }, 'tipo', 'plataforma', 'nome', 'resolucao', 'bandas', 'nivel_produto'
    ])
    const query = db.pgp.helpers.insert(sensores, cs, {
      table: 'sensor_carta_ortoimagem',
      schema: 'metadado'
    })
    await t.none(query)
  })
}

controller.atualizaSensorCartaOrtoimagem = async sensores => {
  return db.sapConn.tx(async t => {
    const cs = new db.pgp.helpers.ColumnSet([
      'id', { name: 'produto_id', def: null }, { name: 'lote_id', def: null }, 'tipo', 'plataforma', 'nome', 'resolucao', 'bandas', 'nivel_produto'
    ])
    const query =
      db.pgp.helpers.update(
        sensores,
        cs,
        { table: 'sensor_carta_ortoimagem', schema: 'metadado' },
        { tableAlias: 'X', valueAlias: 'Y' }
      ) + 'WHERE Y.id = X.id'
    await t.none(query)
  })
}

controller.deleteSensorCartaOrtoimagem = async sensorIds => {
  return db.sapConn.task(async t => {
    const exists = await t.any(
      `SELECT id FROM metadado.sensor_carta_ortoimagem
      WHERE id in ($<sensorIds:csv>)`,
      { sensorIds }
    )
    if (exists && exists.length < sensorIds.length) {
      throw new AppError(
        'O id informado não corresponde a um sensor de carta ortoimagem',
        httpCode.BadRequest
      )
    }
    return t.any(
      `DELETE FROM metadado.sensor_carta_ortoimagem
      WHERE id in ($<sensorIds:csv>)`,
      { sensorIds }
    )
  })
}

// ----------------------------------------------------------------------------
// Geracao do JSON de edicao da carta (consumido pelo plugin Ferramentas de Edicao)
// ----------------------------------------------------------------------------

// dominio.tipo_produto (code) -> nome do tipo_produto que o plugin espera.
const TIPO_PRODUTO_PLUGIN = {
  2: 'Carta Topográfica',   // T34-700 (legado)
  3: 'Carta Ortoimagem',
  12: 'Carta Topográfica',  // ET-RDG
  19: 'Carta Ortoimagem OM'
}

const TIPOS_ORTO = [3, 4, 19, 22]

// Template de XML de metadados por tipo_produto. Cada produto gera UM XML, pelo seu tipo:
// carta topografica -> topo; carta ortoimagem -> orto; CDGV vetorial -> vetor.
// (O CDGV e um produto separado, com uuid proprio; nao se deriva da carta.)
const XML_KIND_POR_TIPO = {
  2: 'topo', 12: 'topo',
  3: 'orto', 19: 'orto',
  1: 'vetor', 7: 'vetor', 8: 'vetor', 20: 'vetor', 22: 'vetor', 23: 'vetor'
}

const resolveTipoVersao = (infoEdicao, produto) => {
  const ehOrto = TIPOS_ORTO.includes(produto.tipo_produto_id)
  const ehOM = produto.tipo_produto_id === 19
  let tipo = infoEdicao.tipo_produto
  if (!tipo) {
    // sem tipo_produto explicito: deriva do mapa. Se o tipo_produto_id nao estiver
    // mapeado, deixa indefinido de proposito (o validador acusa) em vez de cair
    // num default 'Carta Topográfica' silenciosamente errado.
    const base = TIPO_PRODUTO_PLUGIN[produto.tipo_produto_id]
    if (base) {
      tipo = (infoEdicao.carta_militar && !ehOM)
        ? (ehOrto ? 'Carta Ortoimagem Militar' : 'Carta Topográfica Militar')
        : base
    }
  }
  let versao = infoEdicao.versao_produto
  if (!versao) versao = ehOM ? '1.0' : (ehOrto ? '3.0' : '2.0')
  return { tipo, versao, ehOrto, ehOM }
}

// Regra de contaminacao de licenca (regra do chefe): FABDEM/FathomDEM (nao
// comercial) OBRIGA CC-BY-NC-SA, mesmo que um valor comercial tenha sido gravado
// por engano em licenca_produto. Fora isso, respeita o valor explicito ou default.
const resolveLicenca = infoEdicao => {
  const origem = infoEdicao.origem_dados_altimetricos || ''
  if (/FABDEM|FathomDEM/i.test(origem)) return 'CC-BY-NC-SA 4.0'
  return infoEdicao.licenca_produto || 'CC-BY-SA 4.0'
}

const LICENCAS_VALIDAS = ['CC-BY-SA 4.0', 'CC-BY-NC-SA 4.0']
const TIPOS_VALIDOS = [
  'Carta Topográfica', 'Carta Ortoimagem', 'Carta Ortoimagem OM',
  'Carta Topográfica Militar', 'Carta Ortoimagem Militar'
]

// Porta de QA: mesmas obrigatorias que o plugin (config/jsonStructure.py) confere.
const validarJsonEdicao = json => {
  const erros = []
  if (!json.tipo_produto || !TIPOS_VALIDOS.includes(json.tipo_produto)) {
    erros.push('tipo_produto ausente ou fora dos valores aceitos pelo plugin')
  }
  if (!json.versao_produto) erros.push('versao_produto ausente')
  if (!json.nome) erros.push('nome ausente')
  if (!json.inom && !json.center) erros.push('inom (ou center, na carta nao-SCN) ausente')
  if (json.licenca_produto && !LICENCAS_VALIDAS.includes(json.licenca_produto)) {
    erros.push('licenca_produto fora dos valores aceitos (CC-BY-SA 4.0 / CC-BY-NC-SA 4.0)')
  }
  if (!json.banco || !json.banco.servidor || !json.banco.porta || !json.banco.nome) {
    erros.push('banco de edicao (servidor/porta/nome) nao resolvido a partir das UTs da fase de Edicao')
  }
  const mde = json.mde_diagrama_elevacao || {}
  if (!mde.caminho_mde || !mde.epsg) erros.push('mde_diagrama_elevacao (caminho_mde/epsg) incompleto')
  if (mde.caminho_mde && /\s/.test(mde.caminho_mde)) erros.push('caminho_mde contem espaco (a exportacao falha)')
  if (!Array.isArray(json.fases) || json.fases.length === 0) erros.push('fases ausente (quadro_fases)')
  const it = json.info_tecnica || {}
  for (const k of ['data_criacao', 'pec_planimetrico', 'pec_altimetrico', 'datum_vertical', 'origem_dados_altimetricos']) {
    if (!it[k]) erros.push(`info_tecnica.${k} ausente`)
  }
  if (!Array.isArray(it.dados_terceiros)) erros.push('info_tecnica.dados_terceiros ausente')
  const ehOrto = /Ortoimagem/.test(json.tipo_produto) && !/OM/.test(json.tipo_produto)
  if (ehOrto) {
    if (!Array.isArray(json.imagens) || !json.imagens.length) erros.push('imagens ausente (carta ortoimagem)')
    if (!Array.isArray(json.sensores) || !json.sensores.length) erros.push('sensores ausente (carta ortoimagem)')
  }
  return erros
}

// Resolve servidor/porta/nome do banco de Edicao a partir das UTs do produto.
// configuracao_producao tem o formato servidor:porta/nome (igual ao temporary_login.js).
const resolveBancoEdicao = async (t, produtoId) => {
  // Banco de producao PostGIS (tipo_dado_producao 2/3) das UTs que cobrem a folha.
  // Preferimos a fase Edicao (tipo_fase_id = 4); se o lote nao tiver Edicao, caimos
  // para a fase mais avancada (maior ordem) que tenha banco de producao - senao o
  // banco saia {} em lotes que terminam antes da Edicao (ex.: so Extracao).
  const row = await t.oneOrNone(
    `SELECT dp.configuracao_producao
    FROM macrocontrole.produto AS p
    INNER JOIN macrocontrole.unidade_trabalho AS ut
      ON ut.lote_id = p.lote_id AND ut.geom && p.geom AND st_relate(ut.geom, p.geom, '2********')
    INNER JOIN macrocontrole.subfase AS s ON s.id = ut.subfase_id
    INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
    INNER JOIN macrocontrole.dado_producao AS dp ON dp.id = ut.dado_producao_id
    WHERE p.id = $1 AND dp.tipo_dado_producao_id IN (2,3)
      AND dp.configuracao_producao IS NOT NULL
    ORDER BY (f.tipo_fase_id = 4) DESC, f.ordem DESC
    LIMIT 1`,
    [produtoId]
  )
  if (!row || !row.configuracao_producao) return null
  // formato esperado: servidor:porta/nome. Parse defensivo: se vier malformado,
  // devolve null (o validador acusa "banco nao resolvido") em vez de estourar.
  const m = /^([^:]+):(\d+)\/(.+)$/.exec(row.configuracao_producao)
  if (!m) return null
  // porta como STRING, como nos JSON de producao (ex.: "5434")
  return { servidor: m[1], porta: m[2], nome: m[3] }
}

// Busca metadado preferindo o nivel PRODUTO (excecao) e caindo para o nivel LOTE
// (conjunto homogeneo de folhas, sempre presente em produto.lote_id).
// sqlPorColuna(coluna) devolve a SQL com `WHERE ... <coluna> = $1`.
const fetchUmComFallback = async (t, sqlPorColuna, produtoId, loteId) => {
  let row = await t.oneOrNone(sqlPorColuna('produto_id'), [produtoId])
  if (!row && loteId != null) row = await t.oneOrNone(sqlPorColuna('lote_id'), [loteId])
  return row
}

// Semantica do override por produto nas LISTAS (sensores/imagens/classes): o
// nivel produto SOMA/substitui o do lote quando tem ao menos uma linha. Lista
// vazia no produto = "nao configurado" e herda o lote (NAO ha como dizer
// "explicitamente nenhum" por produto - aceitavel: o caso comum e herdar do lote).
const fetchListaComFallback = async (t, sqlPorColuna, produtoId, loteId) => {
  let rows = await t.any(sqlPorColuna('produto_id'), [produtoId])
  if ((!rows || !rows.length) && loteId != null) rows = await t.any(sqlPorColuna('lote_id'), [loteId])
  return rows || []
}

// Monta (e valida) o JSON de edicao de um unico produto/folha.
const montaJsonEdicao = async (t, produto) => {
  if (produto.tipo_produto_id === 19) {
    throw new AppError(
      'Carta Ortoimagem OM tem schema proprio e nao exporta headless: gere pelo plugin, nao pelo SAP',
      httpCode.BadRequest
    )
  }

  const loteId = produto.lote_id

  const infoEdicao = await fetchUmComFallback(
    t,
    col => `SELECT pec_planimetrico, pec_altimetrico, origem_dados_altimetricos,
    territorio_internacional, acesso_restrito, carta_militar, data_criacao,
    epsg_mde, caminho_mde, dados_terceiro, quadro_fases,
    tipo_produto, versao_produto, licenca_produto, observacoes, dpi
    FROM metadado.informacoes_edicao WHERE ${col} = $1`,
    produto.id, loteId
  )
  if (!infoEdicao) {
    throw new AppError(
      'Produto/lote sem metadado.informacoes_edicao cadastrado (preencha pelo SAP Gerente, por lote ou por produto)',
      httpCode.BadRequest
    )
  }

  const infoProduto = await fetchUmComFallback(
    t,
    col => `SELECT dv.nome AS datum_vertical, e.nome AS especificacao
    FROM metadado.informacoes_produto AS ip
    LEFT JOIN metadado.datum_vertical AS dv ON dv.code = ip.datum_vertical_id
    LEFT JOIN metadado.especificacao AS e ON e.code = ip.especificacao_id
    WHERE ip.${col} = $1`,
    produto.id, loteId
  )

  const banco = await resolveBancoEdicao(t, produto.id)
  const { tipo, versao, ehOrto, ehOM } = resolveTipoVersao(infoEdicao, produto)

  // quadro_fases e JSON livre; aceitamos o array direto ou {fases:[...]}.
  let fases = infoEdicao.quadro_fases
  if (fases && !Array.isArray(fases) && Array.isArray(fases.fases)) fases = fases.fases

  const json = {
    tipo_produto: tipo,
    versao_produto: versao,
    nome: produto.nome || produto.mi || produto.inom,
    edicao_produto: produto.edicao || '1-DSG',
    acesso_restrito: !!infoEdicao.acesso_restrito,
    dpi: infoEdicao.dpi || 300,
    mde_diagrama_elevacao: {
      caminho_mde: infoEdicao.caminho_mde,
      epsg: infoEdicao.epsg_mde
    },
    fases: fases || [],
    banco: banco || {},
    info_tecnica: {
      data_criacao: infoEdicao.data_criacao,
      pec_planimetrico: infoEdicao.pec_planimetrico,
      pec_altimetrico: infoEdicao.pec_altimetrico,
      datum_vertical: infoProduto ? infoProduto.datum_vertical : null,
      origem_dados_altimetricos: infoEdicao.origem_dados_altimetricos,
      dados_terceiros: infoEdicao.dados_terceiro || []
    }
  }

  if (produto.inom) {
    json.inom = produto.inom
  } else if (produto.latitude_centro != null && produto.longitude_centro != null) {
    json.center = { latitude: produto.latitude_centro, longitude: produto.longitude_centro }
    json.escala = produto.denominador_escala
  }

  if (infoEdicao.territorio_internacional) json.territorio_internacional = true
  if (infoProduto && infoProduto.especificacao) json.info_tecnica.especificacao_representacao = infoProduto.especificacao
  if (Array.isArray(infoEdicao.observacoes) && infoEdicao.observacoes.length) {
    json.info_tecnica.observacoes = infoEdicao.observacoes
  }

  // Licenca sempre registrada (regra do chefe). Em carta militar o rodape de
  // direitos e fixo e nao mostra o selo, mas o valor fica gravado e e aceito pelo
  // plugin como opcional (caso Rivera).
  json.licenca_produto = resolveLicenca(infoEdicao)

  if (ehOrto && !ehOM) {
    const imagens = await fetchListaComFallback(
      t,
      col => `SELECT caminho_imagem, caminho_estilo, epsg
      FROM metadado.imagens_carta_ortoimagem WHERE ${col} = $1`,
      produto.id, loteId
    )
    json.imagens = imagens.map(i => {
      const img = { caminho_imagem: i.caminho_imagem, epsg: i.epsg }
      if (i.caminho_estilo) img.caminho_estilo = i.caminho_estilo
      return img
    })

    const sensores = await fetchListaComFallback(
      t,
      col => `SELECT tipo, plataforma, nome, resolucao, bandas, nivel_produto
      FROM metadado.sensor_carta_ortoimagem WHERE ${col} = $1`,
      produto.id, loteId
    )
    json.sensores = sensores

    const classes = await fetchListaComFallback(
      t,
      col => `SELECT cco.classes
      FROM metadado.perfil_classes_complementares_orto AS pcco
      INNER JOIN metadado.classes_complementares_orto AS cco ON cco.id = pcco.classes_complementares_orto_id
      WHERE pcco.${col} = $1`,
      produto.id, loteId
    )
    const classesComplementares = classes.flatMap(c => c.classes || [])
    if (classesComplementares.length) json.classes_complementares = classesComplementares
  }

  const erros = validarJsonEdicao(json)
  return { json, erros }
}

const SELECT_PRODUTO = `SELECT id, uuid, nome, mi, inom, denominador_escala, edicao,
  latitude_centro, longitude_centro, tipo_produto_id, lote_id`

// JSON de edicao de um unico produto (pelo uuid). Usado pela rota publica.
controller.gerarJsonEdicaoProduto = async uuid => {
  return db.sapConn.task(async t => {
    const produto = await t.oneOrNone(
      `${SELECT_PRODUTO} FROM macrocontrole.produto WHERE uuid = $1`,
      [uuid]
    )
    if (!produto) {
      throw new AppError('Produto não encontrado', httpCode.BadRequest)
    }
    return montaJsonEdicao(t, produto)
  })
}

// JSON de edicao de todas as folhas de um lote. Usado pelo SAP Gerente.
controller.gerarJsonEdicaoLote = async loteId => {
  return db.sapConn.task(async t => {
    const produtos = await t.any(
      `${SELECT_PRODUTO} FROM macrocontrole.produto WHERE lote_id = $1 ORDER BY inom, mi, nome`,
      [loteId]
    )
    const resultado = []
    for (const produto of produtos) {
      const item = {
        uuid: produto.uuid,
        inom: produto.inom,
        mi: produto.mi,
        nome: produto.nome
      }
      try {
        const { json, erros } = await montaJsonEdicao(t, produto)
        item.json = json
        item.erros = erros
      } catch (e) {
        item.json = null
        item.erros = [e.message]
      }
      resultado.push(item)
    }
    return resultado
  })
}

// ----------------------------------------------------------------------------
// Geracao do XML de metadados (Perfil MGB / ISO 19115-19139)
// Mesmo padrao do JSON de edicao: monta do banco, com fallback lote->produto.
// Reusa os templates MGB validados (server/src/metadados/xml_templates) por
// SUBSTITUICAO de texto (sem motor de template).
// ----------------------------------------------------------------------------

const XML_TEMPLATE = {
  topo: 'metadados-topo.xml',
  orto: 'metadados-orto.xml',
  vetor: 'metadados-vetor.xml'
}

const EQUIDISTANCIA_POR_ESCALA = { 25000: '10', 50000: '20', 100000: '50', 250000: '100' }

// rationale (descricao do passo de linhagem) por Fase do SAP (dominio.tipo_fase).
// Textos extraidos dos XML de producao; fase sem texto cai no proprio nome.
const RATIONALE_FASE = {
  'Processamento Digital de Imagens': 'Processamento Digital de Imagem - Consiste na manipulação numérica de dados contidos em imagens digitais (realce de imagens, manipulação de brilho e contraste, redimensionamento da imagens, aplicação de filtros diversos, etc.).',
  'Extração': 'Digitalizacao Tela Mono - Processo, também, conhecido como Restituição Monoscópica, que consiste em adquirir a geometria de feições do terreno a partir de um imagens orientadas.',
  'Validação': 'Controle de qualidade direto interno, que tem por finalidade realizar de forma automatizada uma inspeção completa da consistência lógica de um conjunto de dados geoespaciais vetoriais e realizar a correção dos erros verificados.',
  'Edição': 'Consiste na aplicação das representações cartograficas segundo a ET-RDG'
}

// templates lidos do disco uma vez e reusados (sao 3 e nao mudam em runtime)
const XML_TEMPLATE_CACHE = {}
const carregarTemplateXml = nome => {
  if (!XML_TEMPLATE_CACHE[nome]) {
    XML_TEMPLATE_CACHE[nome] = fs.readFileSync(path.join(__dirname, 'xml_templates', nome), 'utf8')
  }
  return XML_TEMPLATE_CACHE[nome]
}

const escapeXml = s =>
  String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const fmtEscala = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

// aceita Date (timestamp do pg) ou DD/MM/AAAA; devolve YYYY-MM-DD (gco:Date).
// Usa os componentes de data LOCAIS (nao toISOString, que e UTC e rolaria o dia
// para atividades concluidas a noite no fuso BRT).
const pad2 = n => String(n).padStart(2, '0')
const isoData = v => {
  if (!v) return ''
  if (v instanceof Date) return `${v.getFullYear()}-${pad2(v.getMonth() + 1)}-${pad2(v.getDate())}`
  const m = String(v).match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`
  return String(v).slice(0, 10)
}

// Monta (e valida) o XML de metadados de UM produto. O template sai do tipo_produto:
// carta topografica -> topo; carta ortoimagem -> orto; CDGV vetorial -> vetor.
// (O CDGV e um produto separado, com uuid proprio; cada produto gera um XML.)
const montaMetadadoXml = async (t, produto) => {
  const kind = XML_KIND_POR_TIPO[produto.tipo_produto_id]
  if (!kind) {
    throw new AppError(
      `tipo_produto ${produto.tipo_produto_id} sem template de metadados (nao e carta nem CDGV vetorial)`,
      httpCode.BadRequest
    )
  }
  const templateNome = XML_TEMPLATE[kind]

  const loteId = produto.lote_id

  const infoProduto = await fetchUmComFallback(
    t,
    col => `SELECT ip.projeto_bdgex, dv.nome AS datum_vertical, e.nome AS especificacao,
    u.nome AS responsavel, cc.nome AS classificacao,
    org.nome AS org_nome, org.site AS org_site, org.endereco AS org_endereco, org.telefone AS org_telefone
    FROM metadado.informacoes_produto AS ip
    LEFT JOIN metadado.datum_vertical AS dv ON dv.code = ip.datum_vertical_id
    LEFT JOIN metadado.especificacao AS e ON e.code = ip.especificacao_id
    LEFT JOIN metadado.usuario AS u ON u.id = ip.responsavel_produto_id
    LEFT JOIN metadado.codigo_classificacao AS cc ON cc.code = ip.grau_sigilo_id
    LEFT JOIN metadado.organizacao AS org ON org.code = ip.organizacao_responsavel_id
    WHERE ip.${col} = $1`,
    produto.id, loteId
  )

  const infoEdicao = await fetchUmComFallback(
    t,
    col => `SELECT data_criacao FROM metadado.informacoes_edicao WHERE ${col} = $1`,
    produto.id, loteId
  )

  // data de edicao real = maior data_fim das atividades finalizadas do produto
  const dataEdicaoRow = await t.oneOrNone(
    `SELECT max(a.data_fim) AS data_edicao
    FROM macrocontrole.produto AS p
    INNER JOIN macrocontrole.unidade_trabalho AS ut
      ON ut.lote_id = p.lote_id AND ut.geom && p.geom AND st_relate(ut.geom, p.geom, '2********')
    INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.tipo_situacao_id = 4
    WHERE p.id = $1`,
    [produto.id]
  )

  const hoje = new Date().toISOString().slice(0, 10)
  const escala = produto.denominador_escala
  const valores = {
    INOM: produto.inom || '',
    MI: produto.mi || '',
    NOME: produto.nome || produto.mi || produto.inom || '',
    UUID: produto.uuid,
    CHEFE_DGEO: (infoProduto && infoProduto.responsavel) || '',
    ORGAO_NOME: (infoProduto && infoProduto.org_nome) || '',
    ORGAO_SITE: (infoProduto && infoProduto.org_site) || '',
    ORGAO_ENDERECO: (infoProduto && infoProduto.org_endereco) || '',
    ORGAO_TELEFONE: (infoProduto && infoProduto.org_telefone) || '',
    ESCALA: String(escala),
    ESCALA_FMT: fmtEscala(escala),
    EQUIDISTANCIA: EQUIDISTANCIA_POR_ESCALA[escala] || '',
    PROJETO: (infoProduto && infoProduto.projeto_bdgex) || '',
    DATUM_VERTICAL: (infoProduto && infoProduto.datum_vertical) || '',
    EDICAO: produto.edicao || '1ª Edição',
    DATA_METADADOS: hoje,
    DATA_CRIACAO: infoEdicao && infoEdicao.data_criacao ? isoData(infoEdicao.data_criacao) : hoje,
    DATA_EDICAO: dataEdicaoRow && dataEdicaoRow.data_edicao ? isoData(dataEdicaoRow.data_edicao) : hoje,
    CLASSIFICACAO: (infoProduto && infoProduto.classificacao) || 'ostensivo'
  }

  let xml = carregarTemplateXml(templateNome)
  for (const k of Object.keys(valores)) {
    xml = xml.split(`{{${k}}}`).join(escapeXml(valores[k]))
  }

  // Linhagem: um processStep por FASE do produto (as fases sao definidas no SAP),
  // com a data real = max(data_fim) das atividades finalizadas daquela fase.
  // Fragmento XML injetado CRU (nao escapar).
  const fasesRows = await t.any(
    `SELECT tf.nome AS fase, max(a.data_fim) AS fim
    FROM macrocontrole.produto AS p
    INNER JOIN macrocontrole.unidade_trabalho AS ut
      ON ut.lote_id = p.lote_id AND ut.geom && p.geom AND st_relate(ut.geom, p.geom, '2********')
    INNER JOIN macrocontrole.subfase AS s ON s.id = ut.subfase_id
    INNER JOIN macrocontrole.fase AS f ON f.id = s.fase_id
    INNER JOIN dominio.tipo_fase AS tf ON tf.code = f.tipo_fase_id
    INNER JOIN macrocontrole.atividade AS a ON a.unidade_trabalho_id = ut.id AND a.tipo_situacao_id = 4
    WHERE p.id = $1
    GROUP BY tf.nome, f.ordem
    ORDER BY f.ordem`,
    [produto.id]
  )
  const chefeXml = escapeXml(valores.CHEFE_DGEO)
  const orgNomeXml = escapeXml(valores.ORGAO_NOME)
  const orgSiteXml = escapeXml(valores.ORGAO_SITE)
  const linhagemProcesso = fasesRows.map(fr => {
    const data = fr.fim ? isoData(fr.fim) : hoje
    return [
      '<gmd:processStep>',
      '\t\t\t\t\t\t<gmd:LI_ProcessStep>',
      '\t\t\t\t\t\t\t<gmd:description>',
      `\t\t\t\t\t\t\t\t<gco:CharacterString>${escapeXml(fr.fase)}</gco:CharacterString>`,
      '\t\t\t\t\t\t\t</gmd:description>',
      '\t\t\t\t\t\t\t<gmd:rationale>',
      `\t\t\t\t\t\t\t\t<gco:CharacterString>${escapeXml(RATIONALE_FASE[fr.fase] || fr.fase)}</gco:CharacterString>`,
      '\t\t\t\t\t\t\t</gmd:rationale>',
      '\t\t\t\t\t\t\t<gmd:dateTime>',
      `\t\t\t\t\t\t\t\t<gco:Date>${data}</gco:Date>`,
      '\t\t\t\t\t\t\t</gmd:dateTime>',
      '\t\t\t\t\t\t\t<gmd:processor>',
      '\t\t\t\t\t\t\t\t<gmd:CI_ResponsibleParty>',
      '\t\t\t\t\t\t\t\t\t<gmd:individualName>',
      `\t\t\t\t\t\t\t\t\t\t<gco:CharacterString>${chefeXml}</gco:CharacterString>`,
      '\t\t\t\t\t\t\t\t\t</gmd:individualName>',
      '\t\t\t\t\t\t\t\t\t<gmd:organisationName>',
      `\t\t\t\t\t\t\t\t\t\t<gco:CharacterString>${orgNomeXml}</gco:CharacterString>`,
      '\t\t\t\t\t\t\t\t\t</gmd:organisationName>',
      '\t\t\t\t\t\t\t\t\t<gmd:positionName>',
      '\t\t\t\t\t\t\t\t\t\t<gco:CharacterString>Chefe DGEO</gco:CharacterString>',
      '\t\t\t\t\t\t\t\t\t</gmd:positionName>',
      '\t\t\t\t\t\t\t\t\t<gmd:contactInfo>',
      '\t\t\t\t\t\t\t\t\t\t<gmd:CI_Contact>',
      '\t\t\t\t\t\t\t\t\t\t\t<gmd:onlineResource>',
      '\t\t\t\t\t\t\t\t\t\t\t\t<gmd:CI_OnlineResource>',
      '\t\t\t\t\t\t\t\t\t\t\t\t\t<gmd:linkage>',
      `\t\t\t\t\t\t\t\t\t\t\t\t\t\t<gco:CharacterString>${orgSiteXml}</gco:CharacterString>`,
      '\t\t\t\t\t\t\t\t\t\t\t\t\t</gmd:linkage>',
      '\t\t\t\t\t\t\t\t\t\t\t\t</gmd:CI_OnlineResource>',
      '\t\t\t\t\t\t\t\t\t\t\t</gmd:onlineResource>',
      '\t\t\t\t\t\t\t\t\t\t</gmd:CI_Contact>',
      '\t\t\t\t\t\t\t\t\t</gmd:contactInfo>',
      '\t\t\t\t\t\t\t\t\t<gmd:role>',
      '\t\t\t\t\t\t\t\t\t\t<gco:CharacterString>contatoDoProcesso</gco:CharacterString>',
      '\t\t\t\t\t\t\t\t\t</gmd:role>',
      '\t\t\t\t\t\t\t\t</gmd:CI_ResponsibleParty>',
      '\t\t\t\t\t\t\t</gmd:processor>',
      '\t\t\t\t\t\t</gmd:LI_ProcessStep>',
      '\t\t\t\t\t</gmd:processStep>'
    ].join('\n')
  }).join('\n\t\t\t\t\t')
  xml = xml.split('{{LINHAGEM_PROCESSO}}').join(linhagemProcesso)

  // Palavras-chave (MD_Keywords): agrupadas por tipo, de metadado.palavra_chave_produto.
  // Keyword e EXCLUSIVAMENTE nivel produto (nao tem nivel lote): toponimia e descricao
  // sao por folha. A escolha e MANUAL: nao ha toponimia automatica.
  const palavrasRows = await t.any(
    `SELECT pcp.nome, tpk.nome AS tipo
      FROM metadado.palavra_chave_produto AS pcp
      INNER JOIN metadado.tipo_palavra_chave AS tpk ON tpk.code = pcp.tipo_palavra_chave_id
      WHERE pcp.produto_id = $1`,
    [produto.id]
  )
  const blocoKeywords = (kws, tipoKw) => [
    '<gmd:descriptiveKeywords>',
    '\t\t\t\t<gmd:MD_Keywords>',
    kws.map(nome => [
      '\t\t\t\t\t<gmd:keyword>',
      `\t\t\t\t\t\t<gco:CharacterString>${escapeXml(nome)}</gco:CharacterString>`,
      '\t\t\t\t\t</gmd:keyword>'
    ].join('\n')).join('\n'),
    '\t\t\t\t\t<gmd:type>',
    `\t\t\t\t\t\t<gco:CharacterString>${escapeXml(tipoKw)}</gco:CharacterString>`,
    '\t\t\t\t\t</gmd:type>',
    '\t\t\t\t</gmd:MD_Keywords>',
    '\t\t\t</gmd:descriptiveKeywords>'
  ].join('\n')
  // Palavras-chave exatamente como cadastradas (escolha manual): sem toponimia
  // automatica. Produto sem palavra-chave cadastrada sai sem descriptiveKeywords.
  const porTipo = {}
  for (const pc of palavrasRows) {
    if (!porTipo[pc.tipo]) porTipo[pc.tipo] = []
    porTipo[pc.tipo].push(pc.nome)
  }
  const palavrasChave = Object.keys(porTipo)
    .map(tipoKw => blocoKeywords(porTipo[tipoKw], tipoKw))
    .join('\n\t\t\t')
  xml = xml.split('{{PALAVRAS_CHAVE}}').join(palavrasChave)

  // preenche os bounding box vazios a partir da geometria do produto (EPSG 4326)
  const bbox = [
    ['westBoundLongitude', produto.bbox_w],
    ['eastBoundLongitude', produto.bbox_e],
    ['southBoundLatitude', produto.bbox_s],
    ['northBoundLatitude', produto.bbox_n]
  ]
  for (const [tag, val] of bbox) {
    if (val == null) continue
    const re = new RegExp(`(<gmd:${tag}>\\s*<gco:Decimal>)(</gco:Decimal>)`, 'g')
    xml = xml.replace(re, `$1${val}$2`)
  }

  const erros = []
  if (!valores.UUID) erros.push('fileIdentifier (uuid) vazio')
  if (!infoProduto) erros.push('produto/lote sem metadado.informacoes_produto (preencha pelo SAP Gerente)')
  // escala fora de EQUIDISTANCIA_POR_ESCALA -> elemento de distancia da curva vazio
  if (/<gmd:distance>\s*<gco:Decimal>\s*<\/gco:Decimal>\s*<\/gmd:distance>/.test(xml)) {
    erros.push(`equidistancia nao mapeada para a escala ${escala}: o campo de distancia da curva ficou vazio (preencher manualmente)`)
  }
  const restantes = xml.match(/\{\{[A-Z_]+\}\}/g)
  if (restantes) erros.push('placeholders nao preenchidos: ' + Array.from(new Set(restantes)).join(', '))
  if (!valores.ORGAO_NOME) erros.push('organizacao responsavel nao definida (informacoes_produto.organizacao_responsavel_id)')
  return { xml, erros, kind }
}

const SELECT_PRODUTO_XML = `SELECT id, uuid, nome, mi, inom, denominador_escala, edicao,
  tipo_produto_id, lote_id,
  ST_XMin(geom) AS bbox_w, ST_XMax(geom) AS bbox_e, ST_YMin(geom) AS bbox_s, ST_YMax(geom) AS bbox_n`

// XML de metadados de um produto (pelo uuid). O template (carta topo/orto ou vetor) sai do
// tipo_produto; o fileIdentifier e o proprio produto.uuid. Rota publica.
controller.gerarMetadadoXmlProduto = async uuid => {
  return db.sapConn.task(async t => {
    const produto = await t.oneOrNone(
      `${SELECT_PRODUTO_XML} FROM macrocontrole.produto WHERE uuid = $1`,
      [uuid]
    )
    if (!produto) {
      throw new AppError('Produto não encontrado', httpCode.BadRequest)
    }
    const r = await montaMetadadoXml(t, produto)
    return { ...r, uuid: produto.uuid, inom: produto.inom, mi: produto.mi, nome: produto.nome }
  })
}

// XML de metadados de cada produto do lote (uma carta OU um vetor por produto, pelo
// tipo_produto; o CDGV vetorial e um produto separado com uuid proprio). SAP Gerente.
controller.gerarMetadadoXmlLote = async loteId => {
  return db.sapConn.task(async t => {
    const produtos = await t.any(
      `${SELECT_PRODUTO_XML} FROM macrocontrole.produto WHERE lote_id = $1 ORDER BY inom, mi, nome`,
      [loteId]
    )
    const resultado = []
    for (const produto of produtos) {
      if (!XML_KIND_POR_TIPO[produto.tipo_produto_id]) continue // pula o que nao e carta nem CDGV
      const item = { uuid: produto.uuid, inom: produto.inom, mi: produto.mi, nome: produto.nome }
      try {
        const r = await montaMetadadoXml(t, produto)
        item.kind = r.kind
        item.xml = r.xml
        item.erros = r.erros
      } catch (e) {
        item.kind = XML_KIND_POR_TIPO[produto.tipo_produto_id] || null
        item.xml = null
        item.erros = [e.message]
      }
      resultado.push(item)
    }
    return resultado
  })
}

// Exposto só para testes unitários da lógica pura (escape XML, formatação de
// data/escala, regra de licença, derivação de tipo/versão e o portão de QA).
controller._helpers = {
  escapeXml,
  fmtEscala,
  isoData,
  resolveLicenca,
  resolveTipoVersao,
  validarJsonEdicao
}

module.exports = controller
