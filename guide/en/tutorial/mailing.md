# Mailing

Yii simplifies the composition and sending of email messages using
the [yiisoft/mailer](https://github.com/yiisoft/mailer) package. This package provides
content composition functionality and a basic interface for sending emails. By default, the package includes a file
mailer that writes email contents into a file instead of sending them. This is particularly useful during the initial
stages of application development.

To send actual emails, you can use the [Symfony Mailer](https://github.com/yiisoft/mailer-symfony) implementation, which
is used in the examples below.

## Configuring the Mailer

The mailer service allows you to create a message instance, populate it with data, and send it. Typically, you get an
instance from the DI container as `Yiisoft\Mailer\MailerInterface`.

You can also create an instance manually as follows:

```php

use Yiisoft\Mailer\Symfony\Mailer;

/**
 * @var \Symfony\Component\Mailer\Transport\TransportInterface $transport
 */

$mailer = new \Yiisoft\Mailer\Symfony\Mailer(
    $transport,
);
```

The `Yiisoft\Mailer\MailerInterface` provides two main methods:

- `send()` - Sends the given email message.
- `sendMultiple()` - Sends many messages at once.

## Creating a Message

### Simple Text Message

To create a simple message with a text body, use `Yiisoft\Mailer\Message`:

```php
$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Message subject',
    textBody: 'Plain text content'
);
```

### Simple HTML Message

```php
$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Message subject',
    htmlBody: '<b>HTML content</b>'
);
```

### HTML Message from template

For this example, we will use package rendering package [view](https://github.com/yiisoft/view).

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

### Using Layouts

You can also pass parameters to layouts from your template message:

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

### Layout Example

You can wrap the view rendering result in a layout, similar to how layouts work in web applications. This is useful for
setting up shared content like CSS styles:

```php
<?php
/* @var $content string Mail contents as view render result */
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

## Adding More Data

The `Yiisoft\Mailer\MessageInterface` provides several methods to customize your message:

- `withCharset()` - Returns a new instance with the specified charset.
- `withFrom()` - Returns a new instance with the specified sender email address.
- `withTo()` - Returns a new instance with the specified recipient(s) email address.
- `withReplyTo()` - Returns a new instance with the specified reply-to address.
- `withCc()` - Returns a new instance with the specified Cc (extra copy receiver) addresses.
- `withBcc()` - Returns a new instance with the specified Bcc (hidden copy receiver) addresses.
- `withSubject()` - Returns a new instance with the specified message subject.
- `withDate()` - Returns a new instance with the specified date when the message was sent.
- `withPriority()` - Returns a new instance with the specified priority of this message.
- `withReturnPath()` - Returns a new instance with the specified return-path (the bounce address) of this message.
- `withSender()` - Returns a new instance with the specified actual sender email address.
- `withHtmlBody()` - Returns a new instance with the specified message HTML content.
- `withTextBody()` - Returns a new instance with the specified message plain text content.
- `withAddedHeader()` - Returns a new instance with the specified added custom header value.
- `withHeader()` - Returns a new instance with the specified custom header value.
- `withHeaders()` - Returns a new instance with the specified custom header values.

These methods are immutable, meaning they return a new instance of the message with the updated data.

Note `with` prefix. It indicates that the method is immutable and returns a new instance of the class with the changed
data.

### Getters

The following getters are available to retrieve message data:

- `getCharset()` - Returns the charset of this message.
- `getFrom()` - Returns the message sender email address.
- `getTo()` - Returns the message recipient(s) email address.
- `getReplyTo()` - Returns the reply-to address of this message.
- `getCc()` - Returns the Cc (extra copy receiver) addresses of this message.
- `getBcc()` - Returns the Bcc (hidden copy receiver) addresses of this message.
- `getSubject()` - Returns the message subject.
- `getDate()` - Returns the date when the message was sent, or null if it wasn't set.
- `getPriority()` - Returns the priority of this message.
- `getReturnPath()` - Returns the return-path (the bounce address) of this message.
- `getSender()` - Returns the message actual sender email address.
- `getHtmlBody()` - Returns the message HTML body.
- `getTextBody()` - Returns the message text body.
- `getHeader()` - Returns all values for the specified header.
- `__toString()` - Returns string representation of this message.

## Attaching Files

You can attach files to your message using the `withAttached()` method:

```php
use Yiisoft\Mailer\File;

// Attach a file from the local file system
$message = $message->withAttached(
    File::fromPath('/path/to/source/file.pdf'),
);

// Create an attachment on-the-fly
$message = $message->withAttached(
    File::fromContent('Attachment content', 'attach.txt', 'text/plain'),
);
```

## Embedding Images

You can embed images into the message content using the `withEmbedded()` method. This is particularly useful when
composing messages with views:

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

In your view or layout template, you can reference the embedded image using its CID:

```php
<img src="<?= $logoCid; ?>">
```

## Sending a Message

To send an email message:

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

## Sending Multiple Messages

You can send multiple messages at once:

```php
$messages = [];

foreach ($users as $user) {
    $messages[] = (new \Yiisoft\Mailer\Message())
        // ...
        ->withTo($user->email);
}

$result = $mailer->sendMultiple($messages);
```

The `sendMultiple()` method returns a `Yiisoft\Mailer\SendResults` object containing arrays of successfully sent and
failed
messages.

## Implementing your own mail driver

To create a custom mail solution, implement the `Yiisoft\Mailer\MailerInterface` and `Yiisoft\Mailer\MessageInterface`
interfaces.

## For Development

For local or test development, you can use simplified implementations of the mailer that does not send emails.
The package provides these implementations:

- `Yiisoft\Mailer\StubMailer` - A simple mailer that stores messages in a local array.
- `Yiisoft\Mailer\FileMailer` - A mock mailer that saves email messages as files instead of sending them.
- `Yiisoft\Mailer\NullMailer` - A mailer that discards messages without sending or storing them.

To use one of these mailers, configure it in your development environment file Example: `environments/local/di.php`

```php
return [
    Yiisoft\Mailer\MailerInterface::class => Yiisoft\Mailer\StubMailer::class, //or any other
];

```
