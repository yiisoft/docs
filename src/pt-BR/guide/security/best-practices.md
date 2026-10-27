# Boas práticas de segurança

A seguir, vamos revisar princípios comuns de segurança e descrever como
evitar ameaças ao desenvolver aplicações com o Yii.  A maioria desses
princípios não é exclusiva do Yii e vale para o desenvolvimento de sites e
software em geral, por isso você também vai encontrar links para leitura
adicional sobre as ideias gerais por trás deles.


## Princípios básicos

Há dois princípios principais quando o assunto é segurança, não importa qual
aplicação esteja sendo desenvolvida:

1. Filtre a entrada.
2. Escape a saída.


### Filtre a entrada

Filtrar a entrada significa que você nunca deve considerar uma entrada
segura e deve sempre verificar se o valor recebido está de fato entre os
permitidos.  Por exemplo, se você sabe que a ordenação é feita por três
campos, `title`, `created_at` e `status`, e o campo vem da entrada do
usuário, é melhor verificar o valor no mesmo lugar em que você o recebe.  Em
PHP puro, isso ficaria assim:

```php
$sortBy = $_GET['sort'];
if (!in_array($sortBy, ['title', 'created_at', 'status'])) {
	throw new \InvalidArgumentException('Invalid sort value.');
}
```

No Yii, você provavelmente vai usar a validação de formulários para fazer
verificações parecidas.

Leitura adicional sobre o assunto:

- <https://owasp.org/www-community/vulnerabilities/Improper_Data_Validation>
- <https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html>


### Escape a saída

Escapar a saída significa que, dependendo do contexto em que você usa os dados,
você deve prefixá-los com caracteres especiais para anular seu significado especial.
No contexto de HTML, você deve escapar `<`, `>` e caracteres especiais semelhantes.
No contexto de JavaScript ou SQL, o conjunto de caracteres será outro.
Como escapar manualmente é propenso a erros, o Yii fornece várias ferramentas para fazer o escape em diferentes contextos.

Leitura adicional sobre o assunto:

- <https://owasp.org/www-community/attacks/Command_Injection>
- <https://owasp.org/www-community/attacks/Code_Injection>
- <https://owasp.org/www-community/attacks/xss/>


## Evitando SQL injection

SQL injection acontece quando você monta o texto de uma consulta
concatenando strings não escapadas, como a seguir:

```php
$username = $_GET['username'];
$sql = "SELECT * FROM user WHERE username = '$username'";
```

Em vez de informar um nome de usuário correto, um atacante pode passar para
sua aplicação algo como `'; DROP TABLE user; --`.  O SQL resultante será o
seguinte:

```sql
SELECT * FROM user WHERE username = ''; DROP TABLE user; --'
```

Essa é uma consulta válida, que vai buscar usuários com nome de usuário
vazio e depois apagar a tabela `user`, o que provavelmente resulta em um
site quebrado e perda de dados (você configurou backups regulares, certo?).

Use prepared statements do PDO diretamente ou garanta que a biblioteca que
você prefere faça isso.  Com prepared statements, é impossível manipular a
consulta como demonstrado acima.

Se você usa dados para especificar nomes de colunas ou de tabelas, o melhor
é permitir apenas um conjunto predefinido de valores:
 
```php
function actionList($orderBy = null)
{
    if (!in_array($orderBy, ['name', 'status'])) {
        throw new \InvalidArgumentException('Only name and status are allowed to order by.');
    }
    
    // ...
}
```

Leitura adicional sobre o assunto:

- <https://owasp.org/www-community/attacks/SQL_Injection>


## Evitando XSS

XSS, ou cross-site scripting, acontece quando a saída não é escapada corretamente ao enviar HTML para o navegador. Por exemplo,
se o usuário pode informar o nome dele e, em vez de `Alexander`, ele digita `<script>alert('Hello!');</script>`, toda página que
exibe o nome do usuário sem escapá-lo vai executar o JavaScript `alert('Hello!');`, fazendo uma caixa de alerta aparecer
no navegador. Dependendo do site, em vez de um alerta inofensivo, um script assim poderia enviar mensagens em seu nome ou até
fazer transações bancárias.

Evitar XSS no Yii é bem fácil. Há dois casos:

1. Você quer exibir os dados como texto puro.
2. Você quer exibir os dados como HTML.

Se tudo o que você precisa é de texto puro, escapar é tão simples quanto o
seguinte:


```php
<?= \Yiisoft\Html\Html::encode($username) ?>
```

Se precisar ser HTML, você pode ter a ajuda do
[HtmlPurifier](https://github.com/ezyang/htmlpurifier).  Note que o
processamento do HtmlPurifier é bem pesado, então considere usar cache.

Leitura adicional sobre o assunto:

- <https://owasp.org/www-community/attacks/xss/>


## Evitando CSRF

CSRF é a sigla de cross-site request forgery (falsificação de requisição
entre sites). A ideia é que muitas aplicações assumem que as requisições
vindas do navegador de um usuário são feitas pelo próprio usuário. Essa
suposição pode ser falsa.

Por exemplo, o site `an.example.com` tem uma URL `/logout` que, quando acessada com uma simples requisição GET, faz o logout do usuário. Enquanto
for o próprio usuário que faz a requisição, está tudo certo, mas um dia alguém mal-intencionado consegue publicar
`<img src="http://an.example.com/logout">` em um fórum que o usuário visita com frequência. O navegador não faz diferença entre
requisitar uma imagem e requisitar uma página, então, quando o usuário abre uma página com essa tag `<img>` manipulada,
o navegador envia a requisição GET para aquela URL e o usuário é deslogado de `an.example.com`.

Essa é a ideia básica de como um ataque CSRF funciona. Alguém pode dizer que deslogar um usuário não é grave.
Porém, isso foi só um exemplo.
Há muito mais coisas que se pode fazer com essa abordagem.
Por exemplo, disparar pagamentos ou alterar dados. Imagine que um site tem uma URL
`http://an.example.com/purse/transfer?to=anotherUser&amount=2000`. Acessá-la com uma requisição GET causa a transferência de $2000
da conta de um usuário autorizado para o usuário `anotherUser`.
Você sabe que o navegador sempre envia uma requisição GET para carregar uma imagem,
então pode alterar o código para aceitar apenas requisições POST nessa URL.
Infelizmente, isso não vai salvar você, porque um atacante
pode colocar algum código JavaScript no lugar da tag `<img>`, o que permite enviar requisições POST para essa URL também.

Por isso, o Yii aplica mecanismos extras para proteger contra ataques CSRF.

Para evitar CSRF, você deve sempre:

1. Seguir a especificação HTTP. GET não deve alterar o estado da aplicação.
   Veja a [RFC2616](https://www.w3.org/Protocols/rfc2616/rfc2616-sec9.html)
   para mais detalhes.
2. Manter a proteção CSRF do Yii ativada.

O Yii tem proteção CSRF via `Yiisoft\Csrf\CsrfTokenMiddleware`, do pacote
[`yiisoft/csrf`](https://github.com/yiisoft/csrf).  Garanta que ele esteja
na pilha de middlewares da sua aplicação. Para backends AJAX/SPA que usam
autenticação baseada em cookie, o mesmo pacote fornece o
`Yiisoft\Csrf\CsrfHeaderMiddleware`, uma abordagem alternativa que depende
de headers de requisição personalizados e do mecanismo de preflight do CORS
em vez de um token no formulário.

Leitura adicional sobre o assunto:

- <https://owasp.org/www-community/attacks/csrf>
- <https://owasp.org/www-community/SameSite>


## Evitando a exposição de arquivos

Por padrão, o webroot do servidor deve apontar para o diretório `public`, onde fica o `index.php`. Em ambientes de hospedagem
 compartilhada, isso pode ser impossível, e você acaba com todo o código, as configurações e os logs no webroot do servidor.

Nesse caso, lembre-se de negar o acesso a tudo, exceto `web`.  Se isso for
impossível, considere hospedar sua aplicação em outro lugar.


## Evitando informações e ferramentas de debug em produção

No modo debug, o Yii mostra erros bem detalhados, que certamente ajudam no
desenvolvimento.  O problema é que esses erros detalhados também são úteis
para um atacante, já que podem revelar a estrutura do banco de dados,
valores de configuração e partes do seu código.

Nunca rode aplicações em produção com o debugger ou o Gii acessíveis a
todos.  Alguém poderia usá-los para obter informações sobre a estrutura do
banco de dados e o código, ou simplesmente reescrever o código com o que o
Gii gera.

Evite a barra de debug em produção, a menos que seja necessário.  Ela expõe
todos os detalhes possíveis da aplicação e da configuração.  Se você
realmente precisar dela, confira duas vezes se o acesso está restrito apenas
ao seu IP.

Leitura adicional sobre o assunto:

- <https://cheatsheetseries.owasp.org/cheatsheets/Error_Handling_Cheat_Sheet.html>
- <https://owasp.org/www-project-top-ten/>


## Usando conexão segura via TLS

O Yii fornece recursos que dependem de cookies e/ou sessões do PHP. Eles
podem ficar vulneráveis caso sua conexão seja comprometida. O risco diminui
se a aplicação usar conexão segura via TLS (muitas vezes chamado de
[SSL](https://en.wikipedia.org/wiki/Transport_Layer_Security)).

Hoje em dia, qualquer pessoa pode obter um certificado de graça e renová-lo
automaticamente graças ao [Let's Encrypt](https://letsencrypt.org/).

## Configuração segura do servidor

O objetivo desta seção é destacar os riscos que precisam ser considerados ao
criar a configuração de um servidor para servir um site baseado em Yii. Além
dos pontos tratados aqui, pode haver outras opções de configuração
relacionadas à segurança a considerar, então não considere esta seção
completa.

### Evitando ataques via header `Host`

Se o servidor web estiver configurado para servir o mesmo site
independentemente do valor do header `Host`, essa informação pode não ser
confiável e [pode ser falsificada pelo usuário que envia a requisição
HTTP](https://www.acunetix.com/vulnerabilities/web/host-header-attack).
Nessas situações, você deve corrigir a configuração do servidor web para
servir o site apenas para os nomes de host especificados.

Para mais informações sobre a configuração do servidor, consulte a
documentação do seu servidor web:

- Apache 2:
  <https://httpd.apache.org/docs/trunk/vhosts/examples.html#defaultallports>
- Nginx:
  <https://www.nginx.com/resources/wiki/start/topics/examples/server_blocks/>

### Configurando a validação SSL do peer

Há um equívoco comum sobre como resolver problemas de validação de
certificado SSL, como:

```
cURL error 60: SSL certificate problem: unable to get local issuer certificate
```

ou

```
stream_socket_enable_crypto(): SSL operation failed with code 1. OpenSSL Error messages: error:1416F086:SSL routines:tls_process_server_certificate:certificate verify failed
```

Muitas fontes sugerem, erroneamente, desativar a verificação SSL do peer.
Isso nunca deve ser feito, porque abre caminho para ataques do tipo
man-in-the-middle.  Em vez disso, o PHP deve ser configurado corretamente:

1. Baixe
   [https://curl.haxx.se/ca/cacert.pem](https://curl.haxx.se/ca/cacert.pem).
2. Adicione o seguinte ao seu php.ini:
  ```
  openssl.cafile="/path/to/cacert.pem"
  curl.cainfo="/path/to/cacert.pem".
  ```

Note que você deve manter o arquivo atualizado.

## Referências

- [OWASP top 10](https://owasp.org/Top10/)
- [The Basics of Web Application
  Security](https://martinfowler.com/articles/web-security-basics.html), de
  Martin Fowler
- [Manual do PHP: segurança](https://www.php.net/manual/en/security.php)
- [Segurança da informação no
  StackExchange](https://security.stackexchange.com/)

