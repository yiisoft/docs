# 014 — 文档

文档是 Yii 最重要的部分之一。

## 包文档

包的文档可以在 `README.md` 中，也可以在 `docs/{language}/{type}` 中，其中 `{language}`
是语言代码，`{type}` 可以是“guide”、“cookbook”或其他内容。通常，如果包的使用或配置不简单，或者需要翻译，就会有 `docs`。

以下是创建 `docs` 的一些指标：

1. 需要翻译。
2. 存在许多主题。每个主题本身都很大。

如果 readme 的总长度少于约 200 行，则可以将文档保留在 readme 中。

## 权威指南

权威指南
[yiisoft/docs/guide](https://github.com/yiisoft/docs/tree/master/guide/en)
旨在涵盖作为整个框架的包的使用。与包文档不同，它不专注于单个包，而是涵盖某些用例。

指南应遵循 [Microsoft
风格指南](https://learn.microsoft.com/en-us/style-guide/welcome/)。

### 翻译

权威指南在 GitHub Action 中使用 [po4a](https://github.com/mquinson/po4a) 进行翻译。

翻译流程：

- 安装用于处理 `.po`
  翻译文件的应用程序。例如，[Poedit](https://poedit.net/)，[Lokalize](https://apps.kde.org/ru/lokalize/)，[Gtranslator](https://wiki.gnome.org/Apps/Gtranslator)
  或其他。
- 在 `_translations/guide/{lang}`
  中找到要翻译的文件。请注意，如果源文件在子文件夹中，则子文件夹名称会附加到文件名并用下划线分隔，例如，要翻译
  `guide/en/concept/aliases.md` 文件，请找到
  `_translations/guide/{lang}/concept_aliases.md.po` 文件。
- 在 `Poedit` 中从所需本地化的文件夹中打开扩展名为 `.po` 的文件，例如
  `_translations/guide/ru/intro_what-is-yii.md.po`。如果还没有本地化，请创建一个 issue。
- 翻译必要的字符串并推送更改
- 向主仓库打开一个 pull request

> [!CAUTION]
> 不要手动更改 `/guide/{lang}` 中文件的翻译。

如果您更改了英文并想更新翻译：

- 向主仓库打开一个 pull request
- 在 GitHub Action 中成功完成工作流程 `Update docs translation` 后拉取更新的分支
- 通过 `Poedit` 更新 `.po` 文件中的翻译
- 推送更改

## 块

块采用 [GitHub Alerts
格式](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax#alerts)：

```
> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

翻译文档时，这些块指示符不应翻译。保持它们原样，只翻译块内容。要翻译块的标签，每个指南翻译都应该有一个包含翻译的 `blocktypes.json`
文件。以下显示了德语的示例：

```json
{
    "Note": "Hinweis",
    "Tip": "Tipp",
    "Important": "Wichtig",
    "Warning": "Achtung",
    "Caution": "Vorsicht"
}
```

## PHPDoc

如果 PHPDoc 没有为其描述的内容添加任何内容，则不得添加。以下是一个不好的例子：

```php
use Psr\Log\LoggerInterface;

/**
 * MyService class
 */
final class MyService extends MyServiceBase
{
    /**
     * @var LoggerInterface logger 
     */
    private LoggerInterface $logger;

    /**
     * MyService constructor.
     * @param LoggerInterface $logger
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @inheritDoc
     */
    public function doit(): bool
    {
        return parent::doit();    
    }
}
```

PHPDoc（如果存在）应描述其添加的元素的目的。

`@see` 标签必须明确引用类方法、属性和常量。这对于在 IDE 中正确显示链接以及在 API 文档中正确显示链接是必要的。

错误代码示例：

```php
/**
 * @see SOME_CONST
 * @see $prop
 * @see doSomething()
 */
final class Example
{
    public const SOME_CONST = '';
    public int $prop;
    public function doSomething(): void {}
}
```

有效代码示例：

```php
/**
 * @see Example::SOME_CONST
 * @see Example::$prop
 * @see Example::doSomething()
 */
final class Example
{
    public const SOME_CONST = '';
    public int $prop;
    public function doSomething(): void {}
}
```

## Readme 检查清单

每个包的 readme 应放置在 `README.md` 中并包含以下内容：

- [ ] Logo.
- [ ] 包的简短描述。它做什么？
- [ ] 质量徽章（构建、代码覆盖率）。
- [ ] 截图（如果适用）。
- [ ] 要求。
- [ ] 安装。通常是 `composer require`。
- [ ] 入门。演示一两个常见的使用示例。
- [ ] 配置。
- [ ] 贡献。它应该包含指南的链接。
- [ ] 运行测试。
- [ ] 许可证。
