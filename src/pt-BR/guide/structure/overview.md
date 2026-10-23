# Visão geral

O código de aplicações Yii normalmente é agrupado em módulos por
contexto. Dentro de cada módulo, pode haver um agrupamento por tipo.

Por exemplo, se a aplicação for uma loja online, os contextos poderiam ser:

- Cliente
  - Perfil
  - Lista de produtos
  - Checkout
- Logística
- Entrega
  - Endereços
- Helpdesk
  - Suporte
  - Reclamações
  - Devoluções
- Contabilidade
  - Devoluções
  - Transações
  - Impostos

Para um contexto "Customer", localizado no namespace `App\Customer`, a
estrutura seria:

```
App/
  Customer/                          <-- namespace do módulo
    Entity/
      Customer.php                   <-- entidade compartilhada por "Profile" e "Checkout"
    Profile/
      Widget/
        Gravatar.php
      ProfileRepository.php          <-- o repositório geralmente é específico do contexto
      ProfileController.php          <-- ponto de entrada de "Customer\Profile"
    ProductList/                     <-- namespace do módulo 
      Entity/                        <-- entidades específicas de "Customer\ProductList"
        Category.php
        Product.php
      ProductsListController.php     <-- ponto de entrada de "Customer\ProductList"
    Checkout/                        <-- namespace do módulo
      CheckoutController.php
```

Um contexto pode incluir subcontextos. Se uma classe é compartilhada por
vários contextos, ela é movida para o ancestral comum desses contextos.

Um contexto pode ter [um ponto de entrada conhecido como "action" ou
"controller"](action.md). A função dele é receber [uma instância de
requisição](../runtime/request.md), passá-la para a [camada de
domínio](domain.md) em um formato adequado e criar [uma
resposta](../runtime/response.md) com base no retorno da camada de domínio.

Além disso, aplicações Yii também têm o seguinte:

* [scripts de entrada](entry-script.md): são scripts PHP acessíveis
  diretamente pelos usuários finais.  Eles são responsáveis por iniciar um
  ciclo de tratamento de requisição. Normalmente, um único script de entrada
  atende a aplicação inteira.
* [serviços](service.md): normalmente são objetos sem estado registrados no
  container de dependências que fornecem diversos métodos de ação.
* [middleware](middleware.md): representam código que precisa ser executado
  antes e depois do tratamento efetivo de cada requisição pelos handlers de
  action.
