# sap_cli

Interface de linha de comando do SAP, desenhada para **agentes**.

O client web serve humanos, o `sap_cli` serve agentes. São dois clientes da mesma API, com ergonomias diferentes de propósito: a tela otimiza clique e descoberta visual, o CLI otimiza contexto e encadeamento.

```
node sap_cli/sap.js --ajuda
```

## Por que existe

Um agente que opera o SAP pela API crua paga quatro impostos: precisa carregar um catálogo de rotas escrito à mão para descobrir os campos de um recurso, recebe JSON completo quando queria seis colunas, autentica de novo a cada invocação, e descobre tarde demais que o servidor descartou em silêncio o campo que ele digitou errado. O CLI existe para zerar os quatro.

## Os cinco princípios

**1. Nada de contrato copiado.** Campos, tipos, obrigatórios e filtros saem do Joi vivo do `server/` em tempo de execução, via `describe()`. A descrição de cada rota sai dos blocos `@swagger` do próprio `server/`. Não existe arquivo gerado, catálogo em markdown nem documentação paralela para apodrecer.

**2. Prosa curada só para o que a introspecção não alcança** (`lib/regras.js`), curta. Trigger, `UNIQUE`, idempotência, fuso horário: o que o `describe()` não vê e a spec não conta.

**3. Saída compacta por padrão.** O consumidor tem janela finita. O padrão é TSV recortado nas colunas que importam; `--json` continua devolvendo tudo, para quem vai encadear.

**4. Verbos de intenção, não espelho do CRUD.** `sap producao` responde "quanto já foi produzido" em duas requisições. `sap secao2` chama a rota que o **servidor já tem** para montar a Seção 2 do RPCMTec, em vez de reimplementar a agregação aqui: verbo que precisa de regra de negócio nova pertence ao backend.

**5. O guardrail mora na interface.** Validação local, confirmação de ação irreversível e normalização de fuso ficam aqui, não na skill que chama. Skill é de um cliente só; a interface serve todos.

## A fonte do contrato: Joi, não a spec Swagger

O SAP é o único sistema nosso com spec OpenAPI de verdade (283 blocos `@swagger`, 275 operações). Mesmo assim, **a forma do contrato é lida do Joi**, e da spec vem só a prosa (`summary` e `description` de cada rota). A decisão é sustentada por evidência, não por preferência:

| | Joi | spec Swagger |
|---|---|---|
| Quem valida a requisição | **o middleware `utils/schema_validation.js` chama `schema.validate()`** | nada; nenhuma linha do servidor lê a spec |
| Cobertura | todas as rotas com schema | 275 de ~398 operações |
| Módulos do RPCMTec (`campo`, `capacitacao`, `extra_pit`, `pit_nao_producao`, `rh`, `relatorio`, `metadados`) | contrato completo | **zero blocos** |
| Concordância entre os dois | (referência) | **273 divergências** em 90 componentes homônimos |

Três divergências que produziriam um comando errado, se a spec fosse a fonte:

- `produtosIds` (usado no `DELETE /api/projeto/produto`, uma rota destrutiva): a spec anuncia a propriedade `lote_ids` e exige `produto_ids`, que ela nem declara. O Joi só aceita `produto_ids`.
- `statusQuery`: a spec chama de `proxima` o que o Joi chama de `status`. Query não passa por `stripUnknown`, então seguir a spec dá 400.
- `lotes` e `blocos`: a spec omite `status_id`, que é justamente o campo com que se **fecha** um lote.

Além disso, 165 campos que o Joi marca como obrigatórios aparecem como opcionais na spec, e 97 models Joi não têm componente correspondente.

O que a spec **tem** e o Joi não é a frase que explica para que serve a rota, escrita pelo time ao lado dela. Isso não existe em nenhum lugar legível pelo `describe()`. Então: **forma vem do Joi, descrição vem da spec, porquê vem da prosa curada** (`lib/regras.js`), e as três são lidas ao vivo do `server/`. Onde a spec não cobre, o contrato sai completo, só sem as frases.

## Uso

```bash
# contrato (não gasta rede nem credencial)
node sap_cli/sap.js schema              # lista os recursos
node sap_cli/sap.js schema campo        # operações, campos e regras
node sap_cli/sap.js schema login        # o Joi.when() que derruba integração nova

# dia a dia
sap producao --ano 2026 --mes 7         # estado do PIT (com lote e sem lote)
sap secao2 --ano 2026 --mes 7           # Seção 2 do RPCMTec em markdown
sap secao2 --ano 2026 --mes 7 --docx --saida rpcmtec.docx
sap dominio tipo_etapa                  # os códigos que os campos *_id aceitam

# recursos
sap campo listar --campos nome,inicio,fim
sap campo criar --data '{"campo":{...}}' --dry-run
sap pit listar --ano 2026
sap unidade_trabalho listar --lote_id 5     # antes de criar: o POST duplica em silêncio

# lote
sap lote pipeline --plano plano.json        # valida os 7 corpos, offline
sap lote pipeline --plano plano.json --executar --confirmar "<nome>"
sap lote fechar --id 9 --confirmar 9

# produção retroativa
sap finalizar --arquivo lancamentos.json --dry-run
sap finalizar --arquivo lancamentos.json --confirmar 288

# sessão
sap status                              # o SAP está no ar? há token em cache?
sap login                               # autentica uma vez, guarda o token (~10h)
```

As ações de cada recurso saem de `sap schema <recurso>` e **não são uniformes**, porque a API não é: `campo` e `capacitacao` são REST por uuid; `lote`, `bloco`, `produto` e `unidade_trabalho` operam na coleção, com array no corpo até no `DELETE`.

## Ambiente

Nunca ponha senha na linha de comando. Catálogo das chaves no `env-guia.md` do vault.

| Variável | Para quê |
|---|---|
| `SAP_SERVER` | URL do backend, ex.: `http://IP:PORTA` |
| `SAP_USER` | login de admin |
| `SAP_SENHA` | senha (preferir a variável ao `--senha`) |
| `SAP_TOKEN` | JWT pronto, dispensa o login |

O token fica em cache em `~/.sap/sessao-<servidor>.json`, com validade lida do próprio JWT (o SAP assina com 10h). Um arquivo por servidor, para não misturar a instância local com a de produção. `--sem-cache` desliga.

O cliente do login é `sap`. Com `sap_fp` ou `sap_fg` o schema **exige** a lista de plugins e a versão do QGIS, que um agente não tem; com `sap` os dois campos são `Joi.forbidden()`. `--cliente` sobrepõe.

## O que o CLI protege

- **Validação local.** O corpo é conferido contra o Joi antes de sair da máquina, com **as mesmas opções do middleware do servidor**. Corpo torto falha em milissegundos, com o contrato do campo errado impresso junto. Um teste lê `server/src/utils/schema_validation.js` e falha se as opções divergirem, porque divergir dá o pior sintoma possível: o `--dry-run` aprova e o envio real leva 400.
- **Campo descartado em silêncio.** O servidor valida o corpo com `stripUnknown`: campo com nome errado some sem 400 e sem gravar. O CLI avisa, e procura **recursivamente**, porque no SAP o campo errado quase sempre está dentro de `{campo:{...}}` ou de `{lotes:[{...}]}`. É a diferença entre "gravei" e "achei que gravei".
- **Fuso horário.** `inicio`, `fim`, `data_inicio` e `data_fim` são colunas `timestamp with time zone`, e o SAP exibe em UTC-3: uma data sem hora vira meia-noite UTC e aparece no **dia anterior**, às vezes no mês anterior do RPCMTec. O CLI avisa em toda escrita e normaliza para meio-dia UTC no `sap finalizar`, onde "a data é o dia" faz parte do contrato do verbo.
- **Exclusão irreversível.** `deletar` exige `--confirmar` repetindo o alvo. Na família do módulo `projeto` o alvo está no corpo, então apagar dez lotes por engano exige digitar os dez ids.
- **Escrita em lote.** `sap finalizar` pede a **quantidade** em `--confirmar` e mostra o plano antes; se falhar no meio, diz o que já foi lançado e por que reprocessar só o resto é seguro.
- **Pipeline não transacional.** `sap lote pipeline` é dry-run por padrão: só toca a rede com `--executar` mais `--confirmar "<nome do lote>"`. São sete escritas sem transação entre elas, e o passo 4 (unidade de trabalho) **duplica em silêncio** se repetido, porque a tabela não tem `UNIQUE` nenhum.

## Defeitos que a fonte viva revelou

Estão anunciados em `sap schema` e travados por testes que quebram quando o `server/` for corrigido:

- **Quatro rotas de `/api/acompanhamento` respondem 400 sempre**: `/projetos`, `/projeto/:id/informacao_anual/:ano`, `/projeto/:id/informacao_detalhada` e `/projeto/:id/informacao_detalhada/:ano`. Elas declaram `params: anoParam` (que exige a chave `anoParam`) em caminhos que não têm esse parâmetro, e o Joi recusa antes do controller. Uma delas era chamada em toda execução da rotina de consulta do vault.
- **Dois schemas de query citados por rotas nem existem**: `finalizadoQuery` e `mvtParams` ficaram dentro de um bloco comentado do `acompanhamento_schema.js`. O middleware trata `undefined` como "sem schema" e não valida nada.
- **`PUT /api/gerencia/iniciar_modo_local` exige `usuario_id` no corpo e o ignora**: o controller usa o usuário do token.
- **Assimetria entre criar e atualizar produto**: o `POST` exige uuid v4 estrito, o `PUT` aceita qualquer `8-4-4-4-12` hex. O uuid canônico do produto muitas vezes passa no `PUT` e é recusado no `POST`.
- **Lacuna de API**: não existe rota que liste as atividades de um lote, só `GET /api/gerencia/atividade/:id`. Enumerar os ids para o lançamento retroativo ainda exige leitura do banco.

## Testes

```bash
cd sap_cli && npm test
```

Rodam com o `node:test` embutido, sem instalar nada. **59 testes**, todos **contra os schemas reais do `server/`**, não contra mocks: o valor do CLI é não ter cópia do contrato, e testar com schema falso testaria justamente a cópia. Em troca, eles quebram quando o contrato do SAP muda, que é exatamente o alarme que se quer ter.

Cinco grupos:

- **espelho da validação**: lê o `schema_validation.js` do servidor e compara com as opções do CLI;
- **alarme de renomeação**: todo model Joi e toda rota da registry precisam existir no `server/`;
- **decisão Joi × spec**: trava os pontos em que seguir a spec produziria um comando errado;
- **guardrails offline**: dry-run, confirmação, fuso, pipeline;
- **alarmes de defeito**: quebram (com a instrução do que apagar) quando o `server/` for corrigido.

Os caminhos de **rede** não são exercitados, e isso é deliberado: não há instância do SAP alcançável na máquina de desenvolvimento, e mock de HTTP só testaria o mock.

## Dependências

Nenhuma. Só o Node e o `server/` (de onde vem o Joi, através dos próprios arquivos de schema). Isso é o que permite rodar o `sap` num clone recém-baixado, sem `npm install` na pasta do CLI. A spec é lida por varredura dos comentários, não pelo `swagger-jsdoc`, pelo mesmo motivo.

## Estrutura

```
sap.js              roteador e mapa de ajuda
lib/args.js         parser de argumentos próprio
lib/config.js       ambiente, cliente do auth, caminho da sessão
lib/http.js         requisição, envelope, cache de token, gzip defensivo
lib/recursos.js     registry: rota, model Joi por operação, colunas padrão
lib/schema.js       joi.describe() -> contrato legível; validação local; fuso
lib/spec.js         summary/description dos blocos @swagger (só a prosa)
lib/regras.js       a prosa curada que nem o Joi nem a spec alcançam
lib/saida.js        TSV, tabela, JSON, --campos
comandos/           schema, crud, producao (producao/secao2), lote, finalizar,
                    dominio, sessao
```

## Cobertura

Cobre o que o Chefe da DGEO pede de verdade, levantado nas skills que operam o SAP: estado do PIT, Seção 2 do RPCMTec, seções manuais (campo, capacitação, Extra-PIT, PIT não-produção, efetivo), configuração e fechamento de lote, lançamento retroativo de produção e as tabelas de domínio.

Fora do escopo, e por quê: `microcontrole` e `distribuicao` (a API operacional do plugin QGIS, consumida por operador e não pelo chefe), `perigo`, `gerenciador_fme`, os perfis de configuração do módulo `projeto` (são gerência de linha de produção, feita na tela) e `metadados` (52 rotas servidas por outras skills do pipeline da carta). Nada disso aparece hoje nos gestos que as skills registram.
