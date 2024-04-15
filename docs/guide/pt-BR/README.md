# O guia definitivo para Yii 3.0

Este guia é lançado sob os [Termos de Documentação do Yii](https://www.yiiframework.com/license#docs).

Introdução +
------------

* [Sobre o Yii](intro/what-is-yii.md) +
* [Atualizando da versão 2.0](intro/upgrade-from-v2.md) +


Começando -
---------------

* [O que você precisa saber](start/prerequisites.md) +
* [Criando um projeto](start/creating-project.md) +
* [Executando aplicativos](start/workflow.md) +
* [Dizendo olá](start/hello.md) +
* [Trabalhando com formulários](start/forms.md) +
* [Trabalhando com bancos de dados](start/databases.md) !
* [Gerando código com Gii](start/gii.md) -
* [Olhando para o futuro](start/looking-ahead.md) +


Estrutura do aplicativo +
---------------------

* [Visão geral da estrutura do aplicativo](structure/overview.md) +
* [Scripts de entrada](structure/entry-script.md) +
* [Aplicativo](structure/application.md) +
* [Componentes de serviço](structure/service.md) +
* [Ações](estrutura/action.md) +
* [Domínio](structure/domain.md) +
* [Middleware](structure/middleware.md) +
* [Pacotes](structure/package.md) +

Conceitos-chave +
------------

* [Carregamento automático de classe](concept/autoloading.md) +
* [Contêiner de injeção de dependência](concept/di-container.md) +
* [Configuração](concept/configuration.md) +
* [Aliases](concept/aliases.md) +
* [Eventos](concept/events.md) +

Tratamento de solicitações +
-----------------

* [Roteamento e geração de URL](runtime/routing.md) +
* [Solicitação](runtime/request.md) +
* [Resposta](runtime/response.md) +
* [Sessões](runtime/sessions.md) +
* [Cookies](runtime/cookies.md) +
* [Tratamento de erros](runtime/handling-errors.md) +
* [Logging](runtime/logging.md) +

Visualizações -
-----

* [Visualizações](views/view.md) -
* [Widgets](views/widget.md) -
* [Ativos](views/asset.md) -
* [Trabalhando com scripts de cliente](views/client-scripts.md) -
* [Temas](views/theming.md) -
* [Mecanismos de modelo](views/template-engines.md) -


Trabalhando com bancos de dados +-
----------------------

* [Objetos de acesso ao banco de dados](db-dao.md): Conexão a um banco de dados, consultas básicas, transações e manipulação de esquema
* [Construtor de consultas](db-query-builder.md): Consultando o banco de dados usando uma camada de abstração simples
* [Registro ativo](db-active-record.md): O ORM do Active Record, recuperando e manipulando registros e definindo relações
* [Migrações](databases/db-migrations.md): +

Obtendo dados de usuários -
-----------------------

* [Criando formulários](input/forms.md) -
* [Validando entrada](https://github.com/yiisoft/validator/blob/master/docs/guide/en/README.md) +
* [Enviando arquivos](input/file-upload.md) -
* [Coletando entrada tabular](input/tabular-input.md) -


Exibindo dados -
---------------

* [Formatação de dados](output/formatting.md) -
* [Paginação](output/pagination.md) -
* [Ordenação](output/sorting.md) -
* [Provedores de dados](output/data-providers.md) -
* [Widgets de dados](output/data-widgets.md) -

Segurança +-
--------

* [Visão geral da segurança](security/overview.md) +
* [Autenticação](security/authentication.md) +
* [Autorização](security/authorization.md) +-
* [Trabalhando com senhas](security/passwords.md) +
* [Criptografia](security/cryptography.md) +
* [Práticas recomendadas](security/best-practices.md) +


Cache +-
-------

* [Visão geral do cache](caching/overview.md) +
* [Cache de dados](caching/data.md) +
* [Cache de fragmentos](caching/fragment.md) -
* [Cache de página](caching/page.md) -
* [Cache HTTP](cache/http.md) -


API REST -
-----------

* [Início rápido](rest/quick-start.md)
* [Recursos](rest/resources.md)
* [Controladores](rest/controllers.md)
* [Roteamento](rest/routing.md)
* [Autenticação](rest/authentication.md)
* [Limitação de taxa](rest/rate-limiting.md)
* [Versionamento](rest/versioning.md)
* [Tratamento de erros](rest/error-handling.md)

Ferramentas de desenvolvimento -
-----------------

* Barra de ferramentas de depuração e depurador
* Gerando código usando Gii
* Gerando documentação da API


Teste -
-------

* [Visão geral do teste](testing/overview.md)
* [Configuração do ambiente de teste](testing/environment-setup.md)
* [Testes unitários](testing/unit.md)
* [Testes funcionais](testing/funcional.md)
* [Testes de aceitação](testing/acceptance.md)
* [Fixtures](testes/fixtures.md)


Tópicos especiais -
--------------

* [Construindo aplicativo do zero](tutorial/start-from-scratch.md) -
* [Aplicativos de console](tutorial/console-applications.md) +
* [Docker](tutorial/docker.md) -
* [Internacionalização](tutorial/i18n.md) -
* [Mailing](tutorial/mailing.md) +
* [Ajuste de desempenho](tutorial/performance-tuning.md) +
* [Usando Yii com loop de eventos](tutorial/using-with-event-loop.md) +
* [Usando Yii com RoadRunner](tutorial/using-yii-with-roadrunner.md) +
* [Usando Yii com Swoole](tutorial/using-yii-with-swoole.md) +

Widgets -
-------

* [GridView](https://www.yiiframework.com/doc-2.0/yii-grid-gridview.html)
* [ListView](https://www.yiiframework.com/doc-2.0/yii-widgets-listview.html)
* [DetailView](https://www.yiiframework.com/doc-2.0/yii-widgets-detailview.html)
* [ActiveForm](https://www.yiiframework.com/doc-2.0/guide-input-forms.html#activerecord-based-forms-activeform)
* [Menu](https://www.yiiframework.com/doc-2.0/yii-widgets-menu.html)
* [LinkPager](https://www.yiiframework.com/doc-2.0/yii-widgets-linkpager.html)
* [LinkSorter](https://www.yiiframework.com/doc-2.0/yii-widgets-linksorter.html)
* [Bootstrap Widgets](https://www.yiiframework.com/extension/yiisoft/yii2-bootstrap/doc/guide)


Ajudantes +
-------

* [Arrays](https://github.com/yiisoft/arrays/)
* [Files](https://github.com/yiisoft/files/)
* [Html](https://github.com/yiisoft/html/)
* [Json](https://github.com/yiisoft/json)
* [Utilitários de rede](https://github.com/yiisoft/network-utilities/)
* [VarDumper](https://github.com/yiisoft/var-dumper)
* [Strings](https://github.com/yiisoft/strings)

Extras +
------

* [Glossário](glossary.md)