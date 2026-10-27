# Autoload de classes

Como o Yii usa o [Composer](https://getcomposer.org) para gerenciar pacotes,
ele carrega automaticamente as classes desses pacotes sem a necessidade de
fazer `require` dos arquivos explicitamente.  Ao instalar pacotes, o
Composer gera um [autoloader compatível com
PSR-4](https://www.php-fig.org/psr/psr-4/).  Para usá-lo, faça
`require_once` do autoloader `/vendor/autoload.php` no seu arquivo de ponto
de entrada `index.php`.

Você pode usar o autoloader não só para os pacotes instalados, mas também
para a sua aplicação, já que ela também é um pacote.  Para carregar classes
de um determinado namespace, adicione o seguinte ao `composer.json`:

```json
{
    "autoload": {
        "psr-4": {
            "App\\": "src/"
        }
    }
}
```

Onde `App\\` é o namespace raiz e `src/` é a pasta onde ficam suas
classes. Você pode adicionar mais raízes de código-fonte se
precisar. Depois, execute `composer dump-autoload` ou simplesmente `composer
du`, e as classes dos namespaces correspondentes passarão a ser carregadas
automaticamente.

Se você precisar de autoload específico do ambiente de desenvolvimento, que
não seja usado ao executar o Composer com a flag `--no-dev`, adicione-o à
seção `autoload-dev` em vez de `autoload`.

## Referências

- [PSR-4: Autoloader](https://www.php-fig.org/psr/psr-4/).
- [Guia do Composer sobre
  autoload](https://getcomposer.org/doc/01-basic-usage.md#autoloading).
