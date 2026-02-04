# 010 — 代码风格

Yii 3 包中使用的代码格式基于 [PSR-1](https://www.php-fig.org/psr/psr-1/) 和
[PSR-12](https://www.php-fig.org/psr/psr-12/)，并在此基础上添加了额外的规则。

## Names

- 仅使用英语。
- 使用驼峰命名法，包括缩写（例如，`enableIdn`）。
- 使用尽可能短但具有解释性的名称。
- 永远不要修剪或缩写名称。
- 对于 [集合](https://en.wikipedia.org/wiki/Collection_(abstract_data_type))
  的类、接口、trait 和变量，使用 `Collection` 后缀。
- 对中间件类使用 `Middleware` 后缀。

## 类型

- 尽可能声明
  [参数和返回类型](https://www.php.net/manual/en/migration70.new-features.php)。
- [为属性使用类型](https://wiki.php.net/rfc/typed_properties_v2)。
- 使用严格类型。尽可能避免混合类型和联合类型，除非是兼容类型，如 `string|Stringable`。

## 注释

除非没有注释就无法理解代码，否则应避免内联注释。一个好的例子是针对某个 PHP 版本中的 bug 的解决方法。

方法注释是必要的，除非它没有为方法名称和签名已有的内容添加任何内容。

类注释应描述类的目的。

[查看 PHPDoc](https://github.com/yiisoft/docs/blob/master/014-docs.md#phpdoc)。

## 格式化

### 不对齐

属性、变量和常量值赋值不应对齐。phpdoc 标签也是如此。原因是对齐的语句通常会导致更大的差异甚至冲突。

```php
final class X
{
    const A = 'test';
    const BBB = 'test';
    
    private int $property = 42;
    private int $test = 123;
    
    /**
     * @param int $number Just a number.
     * @param array $options Well... options!
     */
    public function doIt(int $number, array $options): void
    {
        $test = 123;
        $anotherTest = 123;
    }
}
```

### 链式调用

链式调用应格式化以提高可读性。如果是不适合 120 个字符行长度的长链，则每个调用应在新行上：

```php
$object
    ->withName('test')
    ->withValue(87)
    ->withStatus(Status::NEW)
    ->withAuthor($author)
    ->withDeadline($deadline);
```

如果是短链，可以在单行上：

```php
$object = $object->withName('test');
```

## 字符串

- 当不涉及变量时，使用 `'Hello!'`
- 要将变量放入字符串，首选 `"Hello, $username!"`

## 类和接口

### 默认为 final

类默认应该是 `final` 的。

### 默认为 private

常量、属性和方法默认应该是 private 的。

### 组合优于继承

优先使用[组合而不是继承](guide/en/concept/di-container.md)。

### 属性、常量和方法顺序

顺序应该如下：

- 常量
- 属性
- 方法

在每个类别中，项目应按可见性排序：

- public
- protected
- private

### 抽象类

抽象类*不应该*使用 `Abstract` 前缀或后缀。

#### 不可变方法

不可变方法约定如下：

```php
public function withName(string $name): self
{
    $new = clone $this;
    $new->name = $name;
    return $new; 
}
```

1. 克隆对象名称为 `$new`。
2. 返回类型为 `self`。

#### 布尔检查方法

用于检查某事是否为真的方法应命名如下：

```php
public function isDeleted(): bool;
public function hasName(): bool;
public function canDoIt(): bool;
```

#### 方法中的标志

最好避免在方法中使用布尔标志。这表明该方法可能做得太多，应该有两个方法而不是一个。

```php
public function login(bool $refreshPage = true): void;
```

最好是两个方法：

```php
public function login(): void;
public function refreshPage(): void;
```

## 变量

为未使用的变量添加下划线（`_`）前缀。例如：

```php
foreach ($items as $key => $_value) {
    echo $key;
}
```

## 导入

优先导入类和函数，而不是使用完全限定名称：

```php
use Yiisoft\Arrays\ArrayHelper;
use Yiisoft\Validator\DataSetInterface;
use Yiisoft\Validator\HasValidationErrorMessage;
use Yiisoft\Validator\Result;

use function is_iterable;
```

## 其他约定

- [命名空间](004-namespaces.md)
- [异常](007-exceptions.md)
- [接口](008-interfaces.md)

