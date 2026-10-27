# Requisição

Uma requisição HTTP tem um método, uma URI, um conjunto de headers e um
corpo:

```
POST /contact HTTP/1.1
Host: example.org
Accept-Language: en-us
Accept-Encoding: gzip, deflate

{
    "subject": "Hello",
    "body": "Hello there, we need to build Yii application together!"
}
```

O método é `POST` e a URI é `/contact`.  Os headers extras informam o host,
o idioma preferido e a codificação.  O corpo pode ser qualquer coisa.  Neste
caso, é um payload JSON.

O Yii usa o [`ServerRequest` da PSR-7](https://www.php-fig.org/psr/psr-7/)
para representar a requisição.  O objeto está disponível nas actions de
controllers e em outros tipos de middleware:

```php
public function view(ServerRequestInterface $request): ResponseInterface
{
    // ...
}
```

## Método

O método pode ser obtido do objeto de requisição:

```php
$method = $request->getMethod();
```

Normalmente ele é um destes:

- GET
- POST
- PUT
- DELETE
- HEAD
- PATCH
- OPTIONS

Se você quiser garantir que o método da requisição é de um tipo específico,
existe uma classe especial com os nomes dos métodos:

```php
use Yiisoft\Http\Method;

if ($request->getMethod() === Method::POST) {
    // method is POST
}
``` 

## URI

Uma URI tem:

- Esquema (`http`, `https`)
- Host (`yiiframework.com`)
- Porta (`80`, `443`)
- Caminho (`/posts/1`)
- Query string (`page=1&sort=+id`)
- Fragmento (`#anchor`)

Você pode obter a `UriInterface` da requisição assim:

```php
$uri = $request->getUri();
``` 

Depois, pode obter vários detalhes pelos métodos dela:

- `getScheme()`
- `getAuthority()`
- `getUserInfo()`
- `getHost()`
- `getPort()`
- `getPath()`
- `getQuery()`
- `getFragment()`
  
## Headers

Há vários métodos para inspecionar os headers da requisição. Para obter
todos os headers como array:

```php
$headers = $request->getHeaders();
foreach ($headers as $name => $values) {
   // ...
}
```

Para obter um único header:

```php
$values = $request->getHeader('Accept-Encoding');
```


Você também pode obter o valor como uma string separada por vírgulas em vez
de um array.  Isso é bem prático quando o header tem um único valor:

```php
if ($request->getHeaderLine('X-Requested-With') === 'XMLHttpRequest') {
    // This is an AJAX request made with jQuery.
    // Note that header presence and name may vary depending on the library used. 
}
```

Para verificar se um header está presente na requisição:

```php
if ($request->hasHeader('Accept-Encoding')) {
    // ...
}
```

## Corpo

Há dois métodos para obter o conteúdo do corpo. O primeiro retorna o corpo
como está, sem parsing:

```php
$body = $request->getBody();
```

`$body` será uma instância de `Psr\Http\Message\StreamInterface`.

Você também pode obter o corpo já interpretado:

```php
$bodyParameters = $request->getParsedBody();
```

O parsing depende da implementação da PSR-7 e pode exigir um middleware para
formatos de corpo personalizados.

```php
<?php
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;

final readonly class JsonBodyParserMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandler $next): Response
    {
        $contentType = $request->getHeaderLine('Content-Type');

        if (strpos($contentType, 'application/json') !== false) {
            $body = $request->getBody();
            $parsedBody = $this->parse($body);
            $request = $request->withParsedBody($parsedBody);
            
        }

        return $next->handle($request);
    }
}
```

## Upload de arquivos

Os arquivos enviados pelo usuário em um formulário com o atributo `enctype`
igual a `multipart/form-data` são tratados por um método especial da
requisição:

```php
$files = $request->getUploadedFiles();
foreach ($files as $file) {
    if ($file->getError() === UPLOAD_ERR_OK) {
        $file->moveTo('path/to/uploads/new_filename.ext');
    }
}
```

Sempre valide o upload antes de ler o stream ou mover o arquivo. O arquivo
pode estar ausente, ser grande demais para a configuração do PHP, ter sido
enviado só em parte, ter sido rejeitado por uma extensão do PHP ou não
corresponder ao tipo e ao tamanho que a sua aplicação espera. O Yii
Validator oferece a regra `Yiisoft\Validator\Rule\File` para isso. Ela
aceita valores `UploadedFileInterface` da PSR-7 e valida os códigos de erro
do upload, a extensão, o tipo MIME e o tamanho. Use
`Yiisoft\Validator\Rule\Each` quando um campo tiver vários arquivos.

O exemplo a seguir trata o upload de um único `avatar`. Ele valida o arquivo
enviado com o Yii Validator, guarda o arquivo fora do diretório público e
gera o próprio nome do arquivo em vez de confiar no nome informado pelo
cliente.

```php
<?php

declare(strict_types=1);

namespace App\Web\Profile;

use finfo;
use Psr\Http\Message\ResponseFactoryInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use RuntimeException;
use Yiisoft\Aliases\Aliases;
use Yiisoft\Http\Status;
use Yiisoft\Validator\Rule\File;
use Yiisoft\Validator\Rule\Image\Image;
use Yiisoft\Validator\Validator;

final readonly class UploadAvatarAction
{
    private const MAX_SIZE = 2 * 1024 * 1024;

    /**
     * @var array<string, string>
     */
    private const EXTENSIONS = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
    ];

    public function __construct(
        private Aliases $aliases,
        private ResponseFactoryInterface $responseFactory,
    ) {
    }

    public function __invoke(ServerRequestInterface $request): ResponseInterface
    {
        $file = $request->getUploadedFiles()['avatar'] ?? null;

        $result = (new Validator())->validate(
            ['avatar' => $file],
            [
                'avatar' => [
                    new File(
                        extensions: ['jpg', 'jpeg', 'png', 'webp'],
                        mimeTypes: array_keys(self::EXTENSIONS),
                        maxSize: self::MAX_SIZE,
                    ),
                    new Image(skipOnError: true),
                ],
            ],
        );

        if (!$result->isValid() || !$file instanceof UploadedFileInterface) {
            $messages = $result->getPropertyErrorMessages('avatar');
            return $this->badRequest(
                $messages === [] ? 'Upload a file in the "avatar" field.' : implode(' ', $messages),
            );
        }

        $uploadDirectory = $this->aliases->get('@runtime/uploads/avatars');
        $this->ensureDirectory($uploadDirectory);

        $temporaryPath = $uploadDirectory . DIRECTORY_SEPARATOR . bin2hex(random_bytes(16)) . '.upload';
        $file->moveTo($temporaryPath);

        $mediaType = (new finfo(FILEINFO_MIME_TYPE))->file($temporaryPath);

        if (!is_string($mediaType) || !isset(self::EXTENSIONS[$mediaType])) {
            unlink($temporaryPath);
            return $this->badRequest('Only JPEG, PNG, and WebP images are allowed.');
        }

        $fileName = bin2hex(random_bytes(16)) . '.' . self::EXTENSIONS[$mediaType];
        $targetPath = $uploadDirectory . DIRECTORY_SEPARATOR . $fileName;

        if (!rename($temporaryPath, $targetPath)) {
            unlink($temporaryPath);
            throw new RuntimeException('Unable to store uploaded file.');
        }

        $response = $this->responseFactory->createResponse(Status::CREATED);
        $response->getBody()->write('Stored as ' . $fileName);

        return $response;
    }

    private function badRequest(string $message): ResponseInterface
    {
        $response = $this->responseFactory->createResponse(Status::BAD_REQUEST);
        $response->getBody()->write($message);

        return $response;
    }

    private function ensureDirectory(string $directory): void
    {
        if (!is_dir($directory) && !mkdir($directory, 0775, true) && !is_dir($directory)) {
            throw new RuntimeException(sprintf('Directory "%s" was not created.', $directory));
        }
    }
}
```

Observações:

- Guarde os uploads em `@runtime` ou em outro diretório não público, a menos
  que os arquivos sejam públicos de propósito.
- Não use `getClientFilename()` como caminho de armazenamento. Quem controla
  esse valor é o navegador, então ele pode ter caracteres inseguros, valores
  que parecem caminhos ou nomes duplicados.
- Não confie apenas em `getClientMediaType()`. Esse valor vem do
  cliente. Use a validação de tipo MIME da regra `File`, a regra `Image`
  para validar imagens e dimensões, ou outro parser no servidor adequado ao
  formato do arquivo.
- Verifique limites do PHP como `upload_max_filesize`, `post_max_size` e
  `max_file_uploads` quando arquivos esperados forem rejeitados antes de a
  action rodar.
- Quando um formulário envia vários arquivos, o array retornado por
  `getUploadedFiles()` tem o mesmo formato dos nomes dos inputs de
  arquivo. Valide-os com `Each(new File(...))` e mova cada
  `UploadedFileInterface` separadamente.
- A regra `File` também valida caminhos de arquivo em string e instâncias de
  `SplFileInfo`. Não passe caminhos enviados pelo usuário diretamente: use
  os objetos de arquivo enviado da PSR-7 vindos da requisição, ou verifique
  a origem do upload antes de validar caminhos do sistema de arquivos.

## Atributos

Os middlewares da aplicação podem definir atributos personalizados na
requisição com o método `withAttribute()`.  Você pode ler esses atributos
com `getAttribute()`.

Argumentos de rota, como o `id` de um padrão de rota `/posts/{id}`, não são
atributos da requisição.  Use `#[RouteArgument]` em um parâmetro da action
ou injete `Yiisoft\Router\CurrentRoute` quando precisar de argumentos ou
metadados da rota.
