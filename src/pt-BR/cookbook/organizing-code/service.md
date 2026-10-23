# Componentes de serviço

A aplicação pode ficar complicada, então faz sentido extrair partes focadas
da lógica de negócio ou da infraestrutura para componentes de serviço. Eles
normalmente são injetados em outros componentes ou em action handlers.  Isso
geralmente é feito por autowiring:

```php
public function actionIndex(CurrentRoute $route, MyService $myService): ResponseInterface
{
    $id = $route->getArgument('id');
    
    // ...
    $extraData = $myService->getExtraData($id);
    
    // ...
}
```

Tecnicamente, o Yii3 não impõe nenhuma limitação sobre como você constrói
serviços. Em geral, não é preciso estender uma classe base nem implementar
uma interface específica:

```php
final readonly class MyService
{
    public function __construct(
        private ExtraDataStorage $extraDataStorage
    )
    {
    }

    public function getExtraData(string $id): array
    {
        return $this->extraDataStorage->get($id);
    }
}
```

Serviços executam uma tarefa ou retornam dados. Eles são criados uma vez,
colocados em um container de DI e então podem ser usados várias vezes. Por
isso, é uma boa ideia manter seus serviços sem estado: nem o próprio serviço
nem qualquer uma de suas dependências devem guardar estado. Você pode
garantir isso usando a palavra-chave `readonly` do PHP no nível da classe.

## Dependências e configuração de serviços

Serviços devem sempre declarar todas as suas dependências de outros serviços
via `__construct()`. Isso permite usar o serviço logo depois de criado e
também serve como indicador de que o serviço faz coisas demais, quando há
dependências demais.

- Depois de criado, o serviço não deve ser reconfigurado em tempo de
  execução.
- A instância do container de DI geralmente **não deve** ser injetada como
  dependência. Prefira interfaces concretas.
- Em caso de inicialização complicada ou "pesada", tente adiá-la até que o
  método do serviço seja chamado.

O mesmo vale para valores de configuração. Eles devem ser fornecidos como
argumento do construtor. Valores relacionados podem ser agrupados em value
objects. Por exemplo, uma conexão com banco de dados geralmente exige a
string DSN, o nome de usuário e a senha.  Esses três podem ser combinados em
uma classe Dsn:

```php
final readonly class Dsn
{
    public function __construct(
        public string $dsn,
        public string $username,
        public string $password
    )
    {
        if (!$this->isValidDsn($dsn)) {
            throw new \InvalidArgumentException('DSN provided is not valid.');
        }
    }
    
    private function isValidDsn(string $dsn): bool
    {
        // verifica se o DSN é válido    
    }
}
```

## Métodos de serviço

Um método de serviço geralmente faz alguma coisa. Pode ser algo simples
repetido exatamente igual, mas normalmente depende do contexto. Por exemplo:

```php
final readonly class PostPersister
{
    public function __construct(
        private Storage $db
    )
    {
    }
    
    public function persist(Post $post)
    {
        $this->db->insertOrUpdate('post', $post);    
    }
}
```

Aqui há um serviço que salva posts em um armazenamento permanente, como um
banco de dados. O objeto que permite a comunicação com um armazenamento
concreto é sempre o mesmo, então é injetado pelo construtor, enquanto o post
salvo pode variar, então é passado como argumento do método.

## Tudo é um serviço?

Muitas vezes faz sentido escolher outro tipo de classe para colocar seu
código. Confira:

- Repositório
- Widget
- [Middleware](middleware.md)
- Entidade
