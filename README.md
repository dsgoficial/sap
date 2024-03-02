# Sistema de Apoio a Produção (SAP)

Serviço em Node.js para gerenciamento da produção cartográfica.

As vantagens são:
* Distribuição automática de atividades aos operadores
* Configuração de camadas, estilos, menus, regras, rotinas que o operador irá receber no QGIS de acordo com a peculiaridade da subfase de produção
* Distribuição de insumos para a atividade
* Controle de permissões do banco de dados PostgreSQL
* Possibilidade de configuração de uma fila de atividades conforme as necessidades do projeto e as habilitações do operador
* Centralização das informações de produção, como data de ínicio, data de fim e quem realizou a atividade
* Acompanhamento gráfico da produção
* Monitoramento da produção por feição, apontamentos ou tela (microcontrole da produção)
* Possibilidade de trabalho em banco de dados geoespaciais contínuo, apresentando somente o subconjunto necessário dos dados para o operador
* Geração de metadados compatíveis com a ET-PCDG
* Integração com [Gerenciador do FME](https://github.com/1cgeo/gerenciador_fme)
* Integração com [DSGTools](https://github.com/dsgoficial/DsgTools)

Para sua utilização é necessária a utilização do [Serviço de Autenticação](https://github.com/1cgeo/auth_server)

Para acesso ao cliente QGIS do usuário verifique [SAP Operador](https://github.com/dsgoficial/SAP_Operador)

Para acesso ao cliente QGIS do gerente verifique [SAP Gerente](https://github.com/dsgoficial/SAP_Gerente)
