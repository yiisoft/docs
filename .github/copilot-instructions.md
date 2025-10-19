# Yii3 Definitive guide, cookbook, and other docs

The project is the source of truth for Yii3 documentation and tips. It is maintained by the Yii team and community.

The documentation is written in GitHub flavor Markdown format.

```
cookbook/en/ - cookbook containing individual recipes about doing things with Yii3.
guide/en/ - guide containing step-by-step instructions for learning Yii3 and covering some conceptual topics.
*.md - some internal docs and top level policies.
```

Yii3 consists of [multiple packages and respective repositories](https://github.com/topics/yii3). 
Each package has its own documentation that could be found in its repository and should be used to learn
about the package.

The documentation is following a Microsoft Docs style guide which is checked with Vale Linter GitHub Action. Results
are available after the action is completed.

Rules are:

- Edits are permitted only in `cookbook/en`, `guide/en` and `.md` files in root directory.
- Conform to `014-docs.md` except translations part.
- Follow individual package documentation when possible.
