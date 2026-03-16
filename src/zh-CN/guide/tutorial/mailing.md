# 邮件发送

Yii 通过 [yiisoft/mailer](https://github.com/yiisoft/mailer)
包简化了电子邮件的编写与发送。该包提供了内容组织功能和基本的邮件发送接口。默认情况下，包内置了一个文件邮件发送器，它将邮件内容写入文件而非实际发送，在应用程序开发初期非常实用。

要发送真实的电子邮件，可以使用 [Symfony Mailer](https://github.com/yiisoft/mailer-symfony)
实现，以下示例均基于此实现。

## 配置邮件发送器

邮件发送器服务允许您创建消息实例、填充数据并发送。通常通过 DI 容器以 `Yiisoft\Mailer\MailerInterface`
的形式获取实例。

您也可以按如下方式手动创建实例：

```php

use Yiisoft\Mailer\Symfony\Mailer;

/**
 * @var \Symfony\Component\Mailer\Transport\TransportInterface $transport
 */

$mailer = new \Yiisoft\Mailer\Symfony\Mailer(
    $transport,
);
```

`Yiisoft\Mailer\MailerInterface` 提供了两个主要方法：

- `send()` - 发送指定的电子邮件消息。
- `sendMultiple()` - 一次性发送多条消息。

## 创建消息

### 简单文本消息

要创建带有纯文本正文的简单消息，请使用 `Yiisoft\Mailer\Message`：

```php
$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Message subject',
    textBody: 'Plain text content'
);
```

### 简单 HTML 消息

```php
$message = new \Yiisoft\Mailer\Message(
    from: 'from@domain.com',
    to: 'to@domain.com',
    subject: 'Message subject',
    htmlBody: '<b>HTML content</b>'
);
```

### 从模板创建 HTML 消息

本示例将使用渲染包 [view](https://github.com/yiisoft/view)。

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

### 使用布局

您也可以从模板消息向布局传递参数：

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

### 布局示例

您可以将视图渲染结果包裹在布局中，与 Web 应用程序中布局的工作方式类似，这对于设置 CSS 样式等共享内容非常有用：

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

## 添加更多数据

`Yiisoft\Mailer\MessageInterface` 提供了多个方法来自定义消息：

- `withCharset()` - 返回指定字符集的新实例。
- `withFrom()` - 返回指定发件人邮箱地址的新实例。
- `withTo()` - 返回指定收件人邮箱地址的新实例。
- `withReplyTo()` - 返回指定回复地址的新实例。
- `withCc()` - 返回指定抄送地址的新实例。
- `withBcc()` - 返回指定密送地址的新实例。
- `withSubject()` - 返回指定邮件主题的新实例。
- `withDate()` - 返回指定发送日期的新实例。
- `withPriority()` - 返回指定优先级的新实例。
- `withReturnPath()` - 返回指定退信地址的新实例。
- `withSender()` - 返回指定实际发件人邮箱地址的新实例。
- `withHtmlBody()` - 返回指定 HTML 正文内容的新实例。
- `withTextBody()` - 返回指定纯文本正文内容的新实例。
- `withAddedHeader()` - 返回添加了指定自定义请求头值的新实例。
- `withHeader()` - 返回指定自定义请求头值的新实例。
- `withHeaders()` - 返回指定多个自定义请求头值的新实例。

这些方法均为不可变方法，即返回包含更新数据的新消息实例。

注意 `with` 前缀，它表示该方法是不可变的，会返回包含变更数据的新类实例。

### 获取器

以下获取器可用于读取消息数据：

- `getCharset()` - 返回消息的字符集。
- `getFrom()` - 返回发件人邮箱地址。
- `getTo()` - 返回收件人邮箱地址。
- `getReplyTo()` - 返回回复地址。
- `getCc()` - 返回抄送地址。
- `getBcc()` - 返回密送地址。
- `getSubject()` - 返回邮件主题。
- `getDate()` - 返回消息发送日期，若未设置则返回 null。
- `getPriority()` - 返回消息优先级。
- `getReturnPath()` - 返回退信地址。
- `getSender()` - 返回实际发件人邮箱地址。
- `getHtmlBody()` - 返回消息的 HTML 正文。
- `getTextBody()` - 返回消息的纯文本正文。
- `getHeader()` - 返回指定请求头的所有值。
- `__toString()` - 返回消息的字符串表示。

## 附加文件

可以使用 `withAttached()` 方法向消息附加文件：

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

## 嵌入图片

可以使用 `withEmbedded()` 方法将图片嵌入消息内容，在使用视图编写消息时尤为有用：

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

在视图或布局模板中，可以通过 CID 引用嵌入的图片：

```php
<img src="<?= $logoCid; ?>">
```

## 发送消息

发送电子邮件消息的方法：

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

## 批量发送消息

可以一次性发送多条消息：

```php
$messages = [];

foreach ($users as $user) {
    $messages[] = (new \Yiisoft\Mailer\Message())
        // ...
        ->withTo($user->email);
}

$result = $mailer->sendMultiple($messages);
```

`sendMultiple()` 方法返回一个 `Yiisoft\Mailer\SendResults` 对象，其中包含发送成功和发送失败的消息数组。

## 实现自定义邮件驱动

要创建自定义邮件解决方案，请实现 `Yiisoft\Mailer\MailerInterface` 和
`Yiisoft\Mailer\MessageInterface` 接口。

## 开发环境

在本地或测试开发环境中，可以使用不实际发送邮件的简化邮件发送器实现。该包提供了以下实现：

- `Yiisoft\Mailer\StubMailer` - 将消息存储在本地数组中的简单邮件发送器。
- `Yiisoft\Mailer\FileMailer` - 将邮件消息保存为文件而非实际发送的模拟邮件发送器。
- `Yiisoft\Mailer\NullMailer` - 直接丢弃消息、不发送也不存储的空邮件发送器。

要使用其中一种发送器，请在开发环境配置文件中进行配置，例如 `environments/local/di.php`：

```php
return [
    Yiisoft\Mailer\MailerInterface::class => Yiisoft\Mailer\StubMailer::class, //or any other
];

```
