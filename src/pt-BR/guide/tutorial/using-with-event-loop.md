# Usando o Yii com event loop

O ciclo normal de execução de uma requisição web em PHP consiste em preparar o ambiente, receber a requisição, processá-la para gerar uma resposta
e enviar o resultado. Depois que a resposta é enviada, a execução termina e o contexto se perde. Então, na requisição
 seguinte, toda a sequência se repete. Essa abordagem tem uma grande vantagem na facilidade de desenvolvimento, já que o desenvolvedor não
precisa se preocupar muito com vazamentos de memória nem com limpar o contexto corretamente. Por outro lado, inicializar tudo a
cada requisição leva tempo e, no total, consome até 50% dos recursos de processamento.

Existe outra forma de rodar uma aplicação: o event loop. A ideia é
inicializar tudo o que for possível uma única vez e depois processar várias
requisições usando esse contexto. Essa abordagem costuma ser chamada de
event loop.

Há várias ferramentas que permitem fazer isso. As principais são
[FrankenPHP](https://frankenphp.dev/), [Rapira](https://rapira.rs/),
[RoadRunner](https://roadrunner.dev/) e [Swoole](https://www.swoole.com/).

## Implicações do event loop

Um worker de event loop basicamente tem esta cara:

```php
initializeContext();
while ($request = getRequest()) {
   $response = process($request);
   emit($response);
}
```

Normalmente, há vários workers processando requisições ao mesmo tempo, como
no php-fpm tradicional.

Isso significa que há mais coisas a considerar ao desenvolver aplicações.

### O processamento é bloqueante

O worker processa as requisições uma a uma, ou seja, o processamento atual
bloqueia o processamento da próxima requisição. Isso significa que processos
demorados, assim como em aplicações PHP comuns, devem ir para segundo plano
usando uma fila.

### Serviços e estado

Como o contexto no event loop é compartilhado entre todas as requisições e
respostas processadas por um mesmo worker, qualquer mudança no estado de um
serviço feita pela requisição anterior pode afetar a requisição atual. Além
disso, isso pode ser um problema de segurança se os dados de um usuário
ficarem disponíveis para outro.

Há duas formas de lidar com isso. A primeira é evitar estado, tornando os
serviços stateless. A palavra-chave `readonly` do PHP pode ajudar nisso. A
segunda é redefinir o estado dos serviços ao fim do processamento da
requisição.  Nesse caso, um state resetter vai ajudar você:

```php
initializeContext();
$resetter = $container->get(\Yiisoft\Di\StateResetter::class);
while ($request = getRequest()) {
   $response = process($request);
   emit($response);
   $resetter->reset(); // Precisamos redefinir o estado desses serviços a cada requisição.
}
```

## Integrações

- [FrankenPHP](using-yii-with-frankenphp.md)
- [Rapira](using-yii-with-rapira.md)
- [RoadRunner](using-yii-with-roadrunner.md)
- [Swoole](using-yii-with-swoole.md)
