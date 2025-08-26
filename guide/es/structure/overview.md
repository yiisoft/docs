# Overview

Yii applications code is typically grouped into modules by context. In each module there could be grouping by type.

For example, if the application is an online store, contexts could be:

- Customer
  - Profile
  - Products list
  - Checkout
- Logistics
- Delivery
  - Addresses
- Helpdesk
  - Support
  - Claims
  - Returns
- Accounting
  - Returns
  - Transactions
  - Taxes

For a "Customer" context, residing under `App\Customer` namespace, structure would be:

```
App/
  Customer/                          <-- module namespace
    Entity/
      Customer.php                   <-- entity shared by "Profile" and "Checkout"
    Profile/
      Widget/
        Gravatar.php
      ProfileRepository.php          <-- repository is usually specific to context
      ProfileController.php          <-- "Customer\Profile" entry point
    ProductList/                     <-- module namespace 
      Entity/                        <-- entities specific to "Customer\ProductList"
        Category.php
        Product.php
      ProductsListController.php     <-- "Customer\ProductList" entry point
    Checkout/                        <-- module namespace
      CheckoutController.php
```

A context may include sub-contexts. If a class is shared by multiple contexts, it is moved to the ancestor of
both contexts.

A context may have [an entry point known as "action" or "controller"](action.md). Its job is to take [a request
instance](../runtime/request.md), pass it to [domain layer](domain.md) in a suitable format, and create
[a response](../runtime/response.md) based on what is returned by domain layer. 

Besides, Yii applications also have the following:

* [entry scripts](entry-script.md): they are PHP scripts that are directly accessible by end users.
  They are responsible for starting a request handling cycle. Typically a single entry script is handling
  whole application.
* [services](service.md): they are typically stateless objects registered within dependency container and
  provide various action methods.
* [middleware](middleware.md): they represent code that need to be invoked before and after the actual
  handling of each request by action handlers.
