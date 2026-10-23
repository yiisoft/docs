# Cache

O cache é uma forma barata e eficaz de melhorar o desempenho de uma
aplicação.  Ao armazenar dados relativamente estáticos no cache e servi-los
a partir dele quando solicitados, a aplicação economiza o tempo que, de
outra forma, precisaria para gerar os dados do zero a cada vez.

O cache pode ocorrer em diferentes níveis e lugares de uma aplicação. No
lado do servidor, no nível mais baixo, o cache pode ser usado para armazenar
dados básicos, como uma lista com as informações dos artigos mais recentes
obtida do banco de dados; e, no nível mais alto, o cache pode ser usado para
armazenar fragmentos ou páginas web inteiras, como o resultado da
renderização dos artigos mais recentes. No lado do cliente, você pode usar o
cache HTTP para manter o conteúdo das páginas visitadas mais recentemente no
cache do navegador.

O Yii suporta todos estes mecanismos de cache:

* [Cache de dados](data.md)
* [Cache de fragmentos](fragment.md)
* [Cache de páginas](page.md)
* [Cache HTTP](http.md)
