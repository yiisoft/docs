# Structuring code by use-case with vertical slices

When building an application, it's important to organize the code in a way that makes it easy to understand, support,
and scale. One popular approach is to structure the code by use-case with vertical slices.

Vertical slices are self-contained pieces of functionality that cover the entire stack, from the user interface to
the data access layer.
Developer organizes each slice around a specific use case, such as creating a new user or updating a product.

When structuring code classically by type (such as models, views, controllers, helpers, etc.), it can be easy to lose
sight of the bigger picture and how different pieces of code interact to support specific features or use cases.
This can lead to code duplication, tight coupling, and poor maintainability as the application grows.

On the other hand, structuring code by use-case makes developers focus on a specific feature or workflow and
understand how different pieces of code work together to support that feature. This approach also helps to keep related
code together in a single directory, making it easier to navigate and support. Vertical slicing also encourages
the use of domain-driven design concepts, such as entities, repositories, and services, which can help to promote
good separation of concerns and modularity.

Additionally, structuring code by use-case can make it easier to test and debug the application since use-case namespace
encapsulates each feature or workflow in its own directory with clear boundaries and well-defined interfaces.

Here's an example directory structure for a PHP application organized using vertical slices:

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

Each vertical slice has its own directory, which has code associated with the use case.

The use-case subdirectories and their respective classes are organized by type within each directory,
omitting a directory if there's a single class of the type. If code is shared between multiple use-cases,
it's moved one level up such as `Model` or `Service`.

## References

- [Application structure overview](../../guide/structure/overview.md)
