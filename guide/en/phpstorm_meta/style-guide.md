## Naming convention:
* All constants sets should be named as `{Class FQN}::{Group name}`
  - Group name should be short and written in capital letters. Use underscore as a words separator. 
  - Example: `\Yiisoft\Http\Status::STATUSES`
  - <details>
    <summary>Real example</summary>

    ```php
    expectedReturnValues(
      \Psr\Http\Message\RequestInterface::getMethod(),
      argumentsSet('\Yiisoft\Http\Method::METHODS'),
    );

    registerArgumentsSet(
      '\Yiisoft\Http\Method::METHODS',
      \Yiisoft\Http\Method::GET,
      \Yiisoft\Http\Method::POST,
      \Yiisoft\Http\Method::PUT,
      \Yiisoft\Http\Method::DELETE,
      \Yiisoft\Http\Method::PATCH,
      \Yiisoft\Http\Method::HEAD,
      \Yiisoft\Http\Method::OPTIONS,
    );
    ```
    </details>

## Meta location:
- Any meta configurations should be placed in `.phpstorm.meta.php` folder in root directory.
- Configurations should be split into some files named as a class, that it configure or directly used to configure other classes.
- Subfolders currently are not available. When it will be able, it should be used.
