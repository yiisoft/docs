# Estruturando o código por caso de uso com vertical slices

Ao construir uma aplicação, é importante organizar o código de forma que ele
seja fácil de entender, manter e escalar. Uma abordagem popular é estruturar
o código por caso de uso com vertical slices.

Vertical slices são partes autocontidas de funcionalidade que cobrem toda a
stack, da interface do usuário à camada de acesso a dados.  O desenvolvedor
organiza cada slice em torno de um caso de uso específico, como criar um
novo usuário ou atualizar um produto.

Ao estruturar o código da forma clássica, por tipo (models, views,
controllers, helpers etc.), é fácil perder de vista o quadro geral e como as
diferentes partes do código interagem para atender funcionalidades ou casos
de uso específicos.  Isso pode levar a duplicação de código, acoplamento
forte e manutenção difícil à medida que a aplicação cresce.

Por outro lado, estruturar o código por caso de uso faz os desenvolvedores
focarem em uma funcionalidade ou fluxo específico e entenderem como as
diferentes partes do código trabalham juntas para atendê-lo. Essa abordagem
também ajuda a manter o código relacionado junto, em um único diretório, o
que facilita a navegação e a manutenção. O vertical slicing também incentiva
o uso de conceitos de domain-driven design, como entidades, repositórios e
serviços, que ajudam a promover uma boa separação de responsabilidades e
modularidade.

Além disso, estruturar o código por caso de uso pode facilitar os testes e o
debug da aplicação, já que o namespace do caso de uso encapsula cada
funcionalidade ou fluxo em seu próprio diretório, com limites claros e
interfaces bem definidas.

Veja um exemplo de estrutura de diretórios de uma aplicação PHP organizada
com vertical slices:

```
src/
└── Blog/
    ├── Model/
    │   ├── Comment.php
    │   ├── CommentRepository.php
    │   ├── Post.php
    │   └── PostRepository.php
    ├── Service/ 
    │   └── MarkdownProcessor.php
    ├── UseCase/
    │   ├── CreateComment/
    │   │   ├── CreateCommentAction.php
    │   │   ├── CreateCommentRequest.php
    │   ├── CreatePost/
    │   │   ├── CreatePostAction.php
    │   │   ├── CreatePostRequest.php
    │   ├── DeleteComment/
    │   │   ├── DeleteCommentAction.php
    │   │   ├── DeleteCommentRequest.php
    │   ├── DeletePost/
    │   │   ├── DeletePostAction.php
    │   │   ├── DeletePostRequest.php
    │   ├── ListComments/
    │   │   ├── ListCommentsAction.php
    │   ├── ListPosts/
    │   │   ├── ListPostsAction.php
    │   ├── UpdatePost/
    │   │   ├── UpdatePostAction.php
    │   │   ├── UpdatePostRequest.php
    │   ├── ViewPost/
    │   │   ├── ViewPostAction.php
    │   ├── Rss/
    │   │   ├── RssAction.php
    |   |   ├── RssBuilder.php
```

Cada vertical slice tem seu próprio diretório, que contém o código associado
ao caso de uso.

Os subdiretórios de caso de uso e suas respectivas classes são organizados
por tipo dentro de cada diretório, omitindo o diretório quando há uma única
classe daquele tipo. Se um código é compartilhado entre vários casos de uso,
ele sobe um nível, como em `Model` ou `Service`.

## Referências

- [Visão geral da estrutura da aplicação](../../guide/structure/overview.md)
