# Envio de e-mails

O Yii simplifica a composição e o envio de e-mails com o pacote
[yiisoft/mailer](https://github.com/yiisoft/mailer). Esse pacote oferece a
composição do conteúdo e uma interface básica para enviar e-mails. Por
padrão, o pacote inclui um mailer de arquivo, que grava o conteúdo dos
e-mails num arquivo em vez de enviá-los. Isso é especialmente útil nas fases
iniciais do desenvolvimento da aplicação.

Para enviar e-mails de verdade, você pode usar a implementação com [Symfony
Mailer](https://github.com/yiisoft/mailer-symfony), que é a usada nos
exemplos abaixo.

## Configurando o mailer

O serviço de mailer permite criar uma instância de mensagem, preenchê-la com
dados e enviá-la. Normalmente, você obtém uma instância do container de DI
como `Yiisoft\Mailer\MailerInterface`.

Você também pode criar uma instância manualmente:

```php

use Yiisoft\Mailer\Symfony\Mailer;

/**
 * @var \Symfony\Component\Mailer\Transport\TransportInterface $transport
 */

$mailer = new \Yiisoft\Mailer\Symfony\Mailer(
    $transport,
);
```

A `Yiisoft\Mailer\MailerInterface` oferece dois métodos principais:

- `send()` - Envia a mensagem de e-mail informada.
- `sendMultiple()` - Envia várias mensagens de uma vez.

## Criando uma mensagem

### Mensagem de texto simples

Para criar uma mensagem simples com corpo em texto, use
`Yiisoft\Mailer\Message`:

```php
$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Message subject',
    textBody: 'Plain text content'
);
```

### Mensagem HTML simples

```php
$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Message subject',
    htmlBody: '<b>HTML content</b>'
);
```

### Mensagem HTML a partir de um template

Neste exemplo, vamos usar o pacote de renderização
[view](https://github.com/yiisoft/view).

```php
/**
 * @var \Yiisoft\View\View $view
 */

$content = $view->render('path/to/view.php', [
    'name' => 'name',
    'code' => 'code',
]);

$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Subject',
    htmlBody: $content
);
```

### Usando layouts

Você também pode passar parâmetros para os layouts a partir do template da
mensagem:

```php
/**
 * @var \Yiisoft\View\View $view
 * @var array $layoutParameters
 */

$messageBody = $view->render('path/to/view.php', [
    'name' => 'name',
    'code' => 'code',
]);

$layoutParameters['content'] = $messageBody;

$content = $view->render('path/to/layout.php', $layoutParameters);

$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Subject',
    htmlBody: $content
);
```

### Exemplo de layout

Você pode envolver o resultado da renderização da view num layout, do mesmo
jeito que os layouts funcionam em aplicações web. Isso é útil para definir
conteúdo compartilhado, como estilos CSS:

```php
<?php
/* @var $content string Conteúdo do e-mail, resultado da renderização da view */
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
</head>
<body>

<?= $content ?>

<footer style="margin-top: 5em">
-- <br>
Mailed by Yii
</footer>

</body>
</html>
```

## Adicionando mais dados

A `Yiisoft\Mailer\MessageInterface` oferece vários métodos para personalizar
a mensagem:

- `withCharset()` - Retorna uma nova instância com o charset informado.
- `withFrom()` - Retorna uma nova instância com o endereço de e-mail do
  remetente informado.
- `withTo()` - Retorna uma nova instância com o(s) endereço(s) de e-mail
  do(s) destinatário(s) informado(s).
- `withReplyTo()` - Retorna uma nova instância com o endereço de resposta
  (reply-to) informado.
- `withCc()` - Retorna uma nova instância com os endereços em Cc
  (destinatários de cópia) informados.
- `withBcc()` - Retorna uma nova instância com os endereços em Bcc
  (destinatários de cópia oculta) informados.
- `withSubject()` - Retorna uma nova instância com o assunto da mensagem
  informado.
- `withDate()` - Retorna uma nova instância com a data de envio da mensagem
  informada.
- `withPriority()` - Retorna uma nova instância com a prioridade da mensagem
  informada.
- `withReturnPath()` - Retorna uma nova instância com o return-path
  (endereço de bounce) da mensagem informado.
- `withSender()` - Retorna uma nova instância com o endereço de e-mail do
  remetente real informado.
- `withHtmlBody()` - Retorna uma nova instância com o conteúdo HTML da
  mensagem informado.
- `withTextBody()` - Retorna uma nova instância com o conteúdo em texto puro
  da mensagem informado.
- `withAddedHeader()` - Retorna uma nova instância com o valor de header
  personalizado adicionado.
- `withHeader()` - Retorna uma nova instância com o valor de header
  personalizado informado.
- `withHeaders()` - Retorna uma nova instância com os valores de headers
  personalizados informados.

Esses métodos são imutáveis, ou seja, retornam uma nova instância da
mensagem com os dados atualizados.

Repare no prefixo `with`. Ele indica que o método é imutável e retorna uma
nova instância da classe com os dados alterados.

### Getters

Os getters a seguir estão disponíveis para obter os dados da mensagem:

- `getCharset()` - Retorna o charset da mensagem.
- `getFrom()` - Retorna o endereço de e-mail do remetente da mensagem.
- `getTo()` - Retorna o(s) endereço(s) de e-mail do(s) destinatário(s) da
  mensagem.
- `getReplyTo()` - Retorna o endereço de resposta (reply-to) da mensagem.
- `getCc()` - Retorna os endereços em Cc (destinatários de cópia) da
  mensagem.
- `getBcc()` - Retorna os endereços em Bcc (destinatários de cópia oculta)
  da mensagem.
- `getSubject()` - Retorna o assunto da mensagem.
- `getDate()` - Retorna a data de envio da mensagem, ou null se ela não foi
  definida.
- `getPriority()` - Retorna a prioridade da mensagem.
- `getReturnPath()` - Retorna o return-path (endereço de bounce) da
  mensagem.
- `getSender()` - Retorna o endereço de e-mail do remetente real da
  mensagem.
- `getHtmlBody()` - Retorna o corpo HTML da mensagem.
- `getTextBody()` - Retorna o corpo em texto da mensagem.
- `getHeader()` - Retorna todos os valores do header informado.
- `__toString()` - Retorna a representação em string da mensagem.

## Anexando arquivos

Você pode anexar arquivos à mensagem com o método `withAttached()`:

```php
use Yiisoft\Mailer\File;

// Anexa um arquivo do sistema de arquivos local
$message = $message->withAttached(
    File::fromPath('/path/to/source/file.pdf'),
);

// Cria um anexo na hora
$message = $message->withAttached(
    File::fromContent('Attachment content', 'attach.txt', 'text/plain'),
);
```

## Incorporando imagens

Você pode incorporar imagens ao conteúdo da mensagem com o método
`withEmbedded()`. Isso é especialmente útil ao compor mensagens com views:

```php
$logo = 'path/to/logo';
$htmlBody = $this->view->render(
    __DIR__ . 'template.php',
    [
        'content' => $content,
        'logoCid' => $logo->cid(),
    ],
);
return new \Yiisoft\Mailer\Message(
            from: 'from@domain.com',
            to: 'to@domain.com',
            subject: 'Message subject',
            htmlBody: $htmlBody,
            embeddings: $logo
        );
```

No template da view ou do layout, você pode referenciar a imagem incorporada
pelo seu CID:

```php
<img src="<?= $logoCid; ?>">
```

## Enviando uma mensagem

Para enviar uma mensagem de e-mail:

```php
/**
 * @var \Yiisoft\View\View $view
 */

$content = $view->render('path/to/view.php', [
    'name' => 'name',
    'code' => 'code',
]);

$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Subject',
    htmlBody: $content
);

$mailer->send($message);
```

## Enviando várias mensagens

Você pode enviar várias mensagens de uma vez:

```php
$messages = [];

foreach ($users as $user) {
    $messages[] = (new \Yiisoft\Mailer\Message())
        // ...
        ->withTo($user->email);
}

$result = $mailer->sendMultiple($messages);
```

O método `sendMultiple()` retorna um objeto `Yiisoft\Mailer\SendResults` com
arrays das mensagens enviadas com sucesso e das que falharam.

## Implementando seu próprio driver de e-mail

Para criar uma solução de e-mail personalizada, implemente as interfaces
`Yiisoft\Mailer\MailerInterface` e `Yiisoft\Mailer\MessageInterface`.

## Para desenvolvimento

Em desenvolvimento local ou em testes, você pode usar implementações
simplificadas do mailer que não enviam e-mails.  O pacote oferece estas
implementações:

- `Yiisoft\Mailer\StubMailer` - Um mailer simples que guarda as mensagens
  num array local.
- `Yiisoft\Mailer\FileMailer` - Um mailer de mentira que grava as mensagens
  de e-mail em arquivos em vez de enviá-las.
- `Yiisoft\Mailer\NullMailer` - Um mailer que descarta as mensagens sem
  enviá-las nem guardá-las.

Para usar um desses mailers, configure-o no arquivo de ambiente de
desenvolvimento. Exemplo: `environments/local/di.php`

```php
return [
    Yiisoft\Mailer\MailerInterface::class => Yiisoft\Mailer\StubMailer::class, //ou qualquer outro
];

```
