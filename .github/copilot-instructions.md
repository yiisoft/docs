# Yii3 Definitive guide, cookbook, and other docs

The project is the source of truth for Yii3 documentation and tips. It is maintained by the Yii team and community.

The documentation is written in GitHub flavor Markdown format.

```
src/cookbook/ - cookbook containing individual recipes about doing things with Yii3.
src/guide/ - guide containing step-by-step instructions for learning Yii3 and covering some conceptual topics.
src/internals - framework team internal guidelines.
```

Yii3 consists of [multiple packages and respective repositories](https://github.com/topics/yii3). 
Each package has its own documentation that could be found in its repository and should be used to learn
about the package.

The documentation is following a Microsoft Docs style guide which is checked with Vale Linter GitHub Action. Results
are available after the action is completed.

Rules are:

- Edits are permitted only in `src/cookbook`, `src/guide` and `src/internals`.
- Conform to `src/internals/014-docs.md` except translations part.
- Follow individual package documentation when possible.
