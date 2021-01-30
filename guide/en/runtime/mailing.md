# Mailing

Yii makes composition and sending of email messages convenient with the help of
[yiisoft/mailer](https://github.com/yiisoft/mailer) package. The package provides content composition functionality,
and a basic interface for sending emails. Out of the box the package provides a file mailer that, instead of
actually sending an email, writes its contents into a file. Such default is useful during initial application
development.

There is also [SwiftMailer-based official driver available](https://github.com/yiisoft/mailer-swiftmailer) as
a separate package that actually can send emails. In the examples of this guide this driver is used.

## Configuring mailer

The mailer service allows to get a message instance and, after it is filled with data, send it.
An instance is usually obtained from DI container as `Yiisoft\Mailer\MailerInterface`.

Manually an instance could be created as follows:

```php
use Yiisoft\Mailer\MessageBodyRenderer;
use Yiisoft\Mailer\MessageFactory;
use Yiisoft\Mailer\SwiftMailer\Mailer;
use Yiisoft\Mailer\SwiftMailer\Message;

/**
 * @var \Psr\EventDispatcher\EventDispatcherInterface $dispatcher
 * @var \Swift_Events_EventListener[] $plugins
 * @var \Swift_Transport $transport
 * @var \Yiisoft\View\View $view
 */

$mailer = new Mailer(
    new MessageFactory(Message::class),
    new MessageBodyRenderer($view, '/path/to/directory/of/view-files'),
    $dispatcher,
    $transport,
    $plugins, // By default, an empty array
);
```

The `Yiisoft\Mailer\MailerInterface` contains 3 methods:

- `compose()` - Creates a new message instance and optionally composes its body content via view rendering.
- `send()` - Sends the given email message.
- `sendMultiple()` - Sends multiple messages at once.

## Creating a message

The `compose()` method of the mailer allows composition of the actual mail messages content via special template
view files such as the following:

```php
<?php

declare(strict_types=1);

use Yiisoft\Html\Html;

/* @var string $content */

echo Html::p(Html::encode($content));
```

In order to compose message content via view file simply pass view name to the `compose()` method:

```php
$message = $mailer->compose('view-name') // A view rendering result becomes the message body.
    ->withFrom('from@domain.com')
    ->withTo('to@domain.com')
    ->withSubject('Message subject')
;
```

You may pass additional view parameters to `compose()` method, which will be available inside the view file:

```php
$message = $mailer->compose('greetings', [
    'user' => $user,
    'advertisement' => $advertContent,
]);
```

You can specify different view files for HTML and plain text message contents:

```php
$message = $mailer->compose([
    'html' => 'contact-html',
    'text' => 'contact-text',
]);
```

If you specify view name as a string, the rendering result will be used as HTML body,
while plain text body will be composed by removing all HTML entities from it.

> If you specify view name as `null` the message instance will be returned without body content.

View rendering result can be wrapped into the layout. It will work the same way as layouts in regular web application.
Layout can be used to set up mail CSS styles or other shared content:

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

You can specify the layouts when creating an instance of the `Yiisoft\Mailer\MessageBodyRenderer`,
which is passed to the mailer constructor.

```php
use Yiisoft\Mailer\MessageBodyRenderer;
use Yiisoft\Mailer\SwiftMailer\Mailer;

/**
 * @var \Psr\EventDispatcher\EventDispatcherInterface $dispatcher
 * @var \Swift_Transport $transport
 * @var \Yiisoft\View\View $view
 * @var \Yiisoft\Mailer\MessageFactory $factory
 */

$renderer = new MessageBodyRenderer(
    $view, 
    '/path/to/directory/of/view-files',
    'HTML layout name', // Default to 'layouts/html'
    'Plain text layout name', // Default to 'layouts/text'
),

$mailer = new Mailer($factory, $renderer, $dispatcher, $transport);
```

> If you specify the layouts as empty strings, the layouts will not be used.

### Adding more data 

After the message is created, we can add actual content to it. The message implements `Yiisoft\Mailer\MessageInterface`
that contains many useful methods for the purpose:

- `withCharset()` - Returns a new instance with the specified charset.
- `withFrom()` - Returns a new instance with the specified sender email address.
- `withTo()` - Returns a new instance with the specified recipient(s) email address.
- `withReplyTo()` - Returns a new instance with the specified reply-to address.
- `withCc()` - Returns a new instance with the specified Cc (additional copy receiver) addresses.
- `withBcc()` - Returns a new instance with the specified Bcc (hidden copy receiver) addresses.
- `withSubject()` - Returns a new instance with the specified message subject.
- `withHtmlBody()` - Returns a new instance with the specified message HTML content.
- `withTextBody()` - Returns a new instance with the specified message plain text content.
- `withAttached()` - Returns a new instance with the specified attached file.
- `withEmbedded()` - Returns a new instance with the specified embedded file.
- `withAddedHeader()` - Returns a new instance with the specified added custom header value.
- `withHeader()` - Returns a new instance with the specified custom header value.
- `withHeaders()` - Returns a new instance with the specified custom header values.
- `withError()` - Returns a new instance with the specified send fails error.

Note `with` prefix. It indicates that method is immutable and returns a new instance of the class with the changed data.
You can add data using a chain of methods:

```php
$message = $mailer->compose(null)
    ->withFrom('from@domain.com')
    ->withTo('to@domain.com')
    ->withSubject('Message subject')
    ->withTextBody('Plain text content')
    ->withHtmlBody('<b>HTML content</b>')
;
```

A number of getters is also available:

- `getCharset()` - Returns the charset of this message.
- `getFrom()` - Returns the message sender email address.
- `getTo()` - Returns the message recipient(s) email address.
- `getReplyTo()` - Returns the reply-to address of this message.
- `getCc()` - Returns the Cc (additional copy receiver) addresses of this message.
- `getBcc()` - Returns the Bcc (hidden copy receiver) addresses of this message.
- `getSubject()` - Returns the message subject.
- `getHtmlBody()` - Returns the message HTML body.
- `getTextBody()` - Returns the message text body.
- `getHeader()` - Returns all values for the specified header.
- `getError()` - Returns error represents why send fails, or `null` on a successful send.
- `__toString()` - Returns string representation of this message.


### Attaching files

You can add attachments to message using the `withAttached()` method:

```php
use Yiisoft\Mailer\File;

// Attach a file from local file system.
$message = $message->withAttached(
    File::fromPath('/path/to/source/file.pdf'),
);

// Create an attachment content on-the-fly.
$message = $message->withAttached(
    File::fromContent('Attachment content', 'attach.txt', 'text/plain')),
);
```

### Embedding images

You can embed images into the message content using `withEmbedded()` method.
This method is easy to use when composing message content via view file:

```php
$imageFile = \Yiisoft\Mailer\File::fromPath('/path/to/image.jpg');

$mailer->compose('embed-email', ['imageFile' => $imageFile])
    ->withEmbedded($imageFile)
    // ...
;
```

Then inside the view file you can use the following code:

```php
<img src="<?= $imageFile->cid(); ?>">
```

The `cid()` method returns the attachment ID, which should be used in `img` tag.



### Sending a message

You can use the following code to send an email message:

```php
$message = $mailer->compose()
   ->withFrom('from@domain.com')
   ->withTo('to@domain.com')
   ->withSubject('Message subject')
   ->withTextBody('Plain text content')
   ->withHtmlBody('<b>HTML content</b>')
;
$mailer->send($message);
```

You may also send several messages at once:

```php
$messages = [];

foreach ($users as $user) {
    $messages[] = $mailer->compose()
        // ...
        ->withTo($user->email)
    ;
}

$mailer->sendMultiple($messages);
```

This method returns an array of failed messages, or an empty array if all messages were sent successfully.

> You can get an error using the `$message->getError()` method.

Some particular mail extensions may benefit from this approach, using single network message etc.

## Implementing your own mail driver

In order to create your own custom mail solution, you need to create 2 classes: one for the `Mailer`
and another one for the `Message`. You can use `Yiisoft\Mailer\Mailer` as the base class for your solution.
This class already contain the basic logic, which is described in this guide. However, their usage is not mandatory,
it is enough to implement `Yiisoft\Mailer\MailerInterface` and `Yiisoft\Mailer\MessageInterface` interfaces.
Then you need to implement all the abstract methods to build your solution.
