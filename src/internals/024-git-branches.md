# 024 — Git branches

Yii package repositories use version branches to make supported releases and active development clear.

The default branch should be the branch with the current stable version. For example, if the latest stable major version
is 3, the default branch should be `3.x`.

Use `master` for the next major version under development. In `composer.json`, add a branch alias that matches the next
major version:

```json
{
    "extra": {
        "branch-alias": {
            "dev-master": "4.0.x-dev"
        }
    }
}
```

When a new major version becomes stable, make its version branch the default branch.
