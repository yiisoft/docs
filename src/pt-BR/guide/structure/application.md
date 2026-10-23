# Aplicação

O principal propósito da aplicação web e do seu runner no Yii3 é processar
requisições para obter respostas.

Normalmente, o ciclo de execução consiste em:

1. Inicialização. Obter a configuração, criar uma instância do container e
   fazer a inicialização adicional do ambiente, como registrar o error
   handler para que ele possa tratar os erros que ocorrerem. Disparar o
   evento `ApplicationStartup`.
2. Tratar requisições passando os objetos de requisição para o dispatcher de
   middlewares, que executa a [pilha de middlewares](middleware.md) e obtém
   um objeto de resposta. Em aplicações PHP comuns, isso é feito uma vez. Em
   [ambientes como o RoadRunner](../tutorial/using-with-event-loop.md), pode
   ser feito várias vezes com a mesma instância da aplicação. O objeto de
   resposta é convertido em uma resposta HTTP real usando o emitter.
   Disparar o evento `AfterEmit`.
3. Encerramento. Disparar o evento `ApplicationShutdown`.
