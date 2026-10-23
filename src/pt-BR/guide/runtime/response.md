# Resposta

Uma resposta HTTP tem um código e uma mensagem de status, um conjunto de
headers e um corpo:

```
HTTP/1.1 200 OK
Date: Mon, 27 Jul 2009 12:28:53 GMT
Server: Apache/2.2.14 (Win32)
Last-Modified: Wed, 22 Jul 2009 19:15:56 GMT
Content-Length: 6 
Content-Type: text/html
Connection: Closed

Hello!
```

O Yii usa o [`Response` da PSR-7](https://www.php-fig.org/psr/psr-7/) na
aplicação web para representar a resposta.

O objeto deve ser criado e retornado como resultado da execução das actions
de controllers ou de outros middlewares.  Normalmente, o middleware recebe
uma response factory injetada no construtor.

```php
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

final readonly class PostAction
{
    public function __construct(
        private ResponseFactoryInterface $responseFactory
    )
    {
    }

    public function view(ServerRequestInterface $request): ResponseInterface
    {
        $response = $this->responseFactory->createResponse();
        $response->getBody()->write('Hello!');
        return $response;
    }
}
```

## Código de status

Você pode definir o código de status assim:

```php
use Yiisoft\Http\Status;

$response = $response->withStatus(Status::NOT_FOUND);
```

A maioria dos códigos de status está disponível na classe `Status`, por
conveniência e legibilidade.

O router pode retornar uma resposta antes de a action rodar.  Por exemplo,
uma requisição `OPTIONS` para o caminho de uma rota conhecida recebe
automaticamente uma resposta `204 No Content` com um header `Allow` listando
os métodos suportados.  Veja [Respostas OPTIONS
automáticas](routing.md#respostas-options-automaticas) para os detalhes de
roteamento.

## Headers

Você pode definir headers assim:

```php
$response = $response->withHeader('Content-type', 'application/json');
```

Se for preciso acrescentar um valor a um header existente:

```php
$response = $response->withAddedHeader('Set-Cookie', 'qwerty=219ffwef9w0f; Domain=somecompany.co.uk; Path=/; Expires=Wed, 30 Aug 2019 00:00:00 GMT');
```

E, se necessário, os headers podem ser removidos:

```php
$response = $response->withoutHeader('Set-Cookie');
```

## Corpo

O corpo da resposta é um objeto que implementa
`Psr\Http\Message\StreamInterface`.

Você pode escrever nele pela própria interface:

```php
$body = $response->getBody();
$body->write('Hello');
```


## Exemplos

### Redirecionando

```php
use Yiisoft\Http\Status;

return $response
  ->withStatus(Status::PERMANENT_REDIRECT)
  ->withHeader('Location', 'https://www.example.com');  
```

Existem status diferentes usados para redirecionamento:

| Código | Constante                    | Para que serve |
|--------|------------------------------|----------------|
| 301    | `Status::MOVED_PERMANENTLY`  | Mudança permanente na estrutura de URLs. Os mecanismos de busca atualizam os índices e os navegadores guardam em cache. |
| 308    | `Status::PERMANENT_REDIRECT` | Como o 301, mas garante que o método HTTP não muda. |
| 302    | `Status::FOUND`              | Mudanças temporárias, como páginas de manutenção. A URL original ainda deve ser usada nas próximas requisições. Os mecanismos de busca normalmente não atualizam os índices. |
| 307    | `Status::TEMPORARY_REDIRECT` | Como o 302, mas garante que o método HTTP não muda. |
| 303    | `Status::SEE_OTHER`          | Depois do envio de formulários, para evitar envios duplicados se o usuário recarregar a página. Indica explicitamente que o redirecionamento deve usar `GET`, mesmo que a requisição original tenha sido `POST`. |

### Respondendo com JSON

```php
use Yiisoft\Http\Status;
use Yiisoft\Json\Json;

$data = [
    'account' => 'samdark',
    'value' => 42
];

$response->getBody()->write(Json::encode($data));
return $response
    ->withStatus(Status::OK)
    ->withHeader('Content-Type', 'application/json');
``` 
