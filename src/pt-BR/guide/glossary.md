# A

## action

Action é um callable, uma classe ou um método de classe que trata uma rota
correspondida e retorna uma resposta.  Leia mais em
["Actions"](structure/action.md).

## alias

Alias é uma string usada pelo Yii para se referir a uma classe ou a um
diretório, como `@app/vendor`.  Leia mais em
["Aliases"](concept/aliases.md).

## aplicação

A aplicação é um objeto que inicializa, trata uma requisição passando pelos
middlewares configurados e encerra.  Leia mais em
["Aplicação"](structure/application.md).

## asset

Asset é um arquivo de recurso. Normalmente contém código JavaScript ou CSS,
mas pode ser qualquer conteúdo estático acessado via HTTP.  Leia mais em
["Assets"](views/asset.md).

## asset bundle

Asset bundle é uma classe PHP que declara um grupo de arquivos CSS,
JavaScript, imagens ou fontes que devem ser publicados e registrados
juntos.  Leia mais em ["Asset bundles"](views/asset.md#asset-bundles).

## autenticação

Autenticação é o processo de determinar a identidade do usuário atual.  Leia
mais em ["Autenticação"](security/authentication.md).

## autorização

Autorização é o processo de verificar se um usuário autenticado ou anônimo
tem permissão para realizar uma ação.  Leia mais em
["Autorização"](security/authorization.md).

## autoloading

Autoloading é o processo de carregar classes PHP automaticamente quando elas
são usadas pela primeira vez.  Leia mais em ["Autoloading de
classes"](concept/autoloading.md).

# B

## bootstrap

Bootstrap é o código de inicialização da aplicação que prepara serviços,
configuração e estado de execução antes do tratamento da requisição.  Leia
mais em ["Configuração"](concept/configuration.md).

# C

## configuração

Configuração pode se referir tanto ao processo de definir propriedades de um
objeto quanto a um arquivo de configuração que guarda definições para um
objeto ou uma classe de objetos.  Leia mais em
["Configuração"](concept/configuration.md).

## container

Container é um objeto que cria serviços, resolve suas dependências e retorna
instâncias configuradas.  Leia mais em ["Container de
DI"](concept/di-container.md#container-de-di).

## controller

Controller é uma classe que agrupa métodos de action de rotas relacionadas.
Leia mais em ["Actions"](structure/action.md).

## cookie

Cookie é um pequeno pedaço de dados guardado pelo navegador e enviado nas
requisições seguintes ao mesmo site.  Leia mais em
["Cookies"](runtime/cookies.md).

## CSRF

CSRF significa cross-site request forgery (falsificação de requisição entre
sites), um ataque em que outro site tenta fazer o navegador de um usuário
enviar uma requisição indesejada para sua aplicação.  Leia mais em
["Evitando CSRF"](security/best-practices.md#evitando-csrf).

# D

## DI

Injeção de dependência é uma técnica de programação em que um objeto recebe
suas dependências de fora.  Leia mais em ["Injeção de dependência e
container"](concept/di-container.md).

# E

## entry script (script de entrada)

O script de entrada é o primeiro script PHP executado em uma aplicação web
ou de console.  Leia mais em ["Scripts de
entrada"](structure/entry-script.md).

## evento

Evento é um objeto que representa algo que aconteceu e que pode ser passado
para listeners.  Leia mais em ["Eventos"](concept/events.md).

# H

## handler

Handler é o código callable escolhido pelo roteamento ou por um middleware
para processar uma requisição e produzir uma resposta.  Leia mais em
["Roteamento e geração de URLs"](runtime/routing.md).

# I

## instalação

Instalação é o processo de preparar algo para funcionar, seja seguindo um
arquivo readme, seja executando um script preparado especialmente para
isso. No caso do Yii, é definir permissões e atender aos requisitos de
software.

# L

## layout

Layout é um template de view que envolve o conteúdo específico de uma página
com a estrutura compartilhada da página.  Leia mais em ["Trabalhando com
layouts"](views/view.md#trabalhando-com-layouts).

# M

## migration

Migration é uma classe PHP versionada que aplica ou reverte uma mudança no
schema ou nos dados do banco de dados.  Leia mais em
["Migrations"](databases/db-migrations.md).

## middleware

Middleware é um processador na pilha de processamento da requisição. Dada
uma requisição, ele pode produzir uma resposta ou fazer alguma ação e passar
o processamento para o próximo middleware.  Leia mais em
["Middleware"](structure/middleware.md).

## model

Model é um objeto que representa dados da aplicação e normalmente contém
regras de validação ou de negócio para esses dados.  Leia mais em
["Trabalhando com formulários"](start/forms.md).

## módulo

O módulo é um namespace que agrupa código com base em um caso de
uso. Normalmente é usado dentro da aplicação principal e pode conter
qualquer código-fonte, definir handlers de URL adicionais ou comandos de
console.

# N

## namespace

Namespace é um [recurso da linguagem
PHP](https://www.php.net/manual/en/language.namespaces.php) para agrupar
várias classes sob um determinado nome.

# P

## pacote

Um pacote normalmente é um [pacote do
Composer](https://getcomposer.org/doc/). É código pronto para reutilização e
redistribuição, que pode ser instalado automaticamente por um gerenciador de
pacotes.

## parâmetro

Parâmetro é um valor de configuração que pode ser usado pelos arquivos de
configuração da aplicação ou de pacotes.  Leia mais em
["Parâmetros"](concept/configuration.md#parametros).

# Q

## queue (fila)

Uma fila é uma estrutura de dados que processa itens na ordem em que
chegaram (primeiro a entrar, primeiro a sair).  O Yii tem o pacote
[yiisoft/queue](https://github.com/yiisoft/queue).

# R

## requisição

Requisição é um objeto PSR-7 que representa uma mensagem HTTP recebida,
incluindo método, URI, headers, corpo, arquivos enviados e atributos.  Leia
mais em ["Requisição"](runtime/request.md).

## resposta

Resposta é um objeto PSR-7 que representa uma mensagem HTTP enviada,
incluindo código de status, headers e corpo.  Leia mais em
["Resposta"](runtime/response.md).

## rota

A rota descreve qual método de requisição e qual padrão de URL devem ser
tratados por qual action ou middleware.  Leia mais em ["Roteamento e geração
de URLs"](runtime/routing.md).

## regra

A regra normalmente se refere a uma regra de validação do pacote
[yiisoft/validator](https://github.com/yiisoft/validator).  Ela guarda um
conjunto de parâmetros para verificar se um conjunto de dados é válido.  O
"rule handler" faz o processamento de fato.

# S

## serviço

Serviço é um objeto focado que realiza trabalho da aplicação ou fornece
comportamento de infraestrutura e normalmente fica registrado no container
de DI.  Leia mais em ["Componentes de serviço"](structure/service.md).

## service provider (provedor de serviços)

Service provider é uma classe que registra definições de serviços
relacionados para o container de DI.  Leia mais em ["Service
providers"](concept/configuration.md#service-providers).

## sessão

Sessão é um armazenamento no servidor associado a um navegador ao longo de
várias requisições.  Leia mais em ["Sessões"](runtime/sessions.md).

# T

## template

Template é um arquivo usado por uma view ou por um template engine para
produzir a saída de apresentação, como HTML.  Leia mais em
["Views"](views/view.md).

# V

## vendor

Vendor é uma organização ou um desenvolvedor individual que fornece código
na forma de pacotes.  Também pode se referir ao [diretório `vendor` do
Composer](https://getcomposer.org/doc/).

## view

A view é responsável por apresentar dados aos usuários finais, normalmente
executando um template com os dados fornecidos.  Leia mais em
["Views"](views/view.md).

# W

## widget

Widget é um componente de view reutilizável que renderiza uma parte da
interface do usuário.  Leia mais em ["Widgets"](views/widget.md).
