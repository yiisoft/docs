# Applying migrations during rolling updates

Rolling updates keep old and new application instances running at the same time. This makes database changes more
delicate than in a single-server deployment: both application versions must work with the same database while the
deployment is in progress.

The safe rule is:

1. Apply database changes that are compatible with the current production code.
2. Deploy code that starts using these database changes.
3. Remove obsolete database structures only after every old application instance is gone.

This is often called the expand and contract pattern. First expand the schema so both versions can use it. Then move
the application code. Finally contract the schema in a later deployment.

## Why this matters

During a rolling update, requests may be served by different versions of the application:

- old code that does not know about the new schema;
- new code that expects the new schema;
- background workers that may lag behind web instances;
- scheduled commands that may run during deployment.

If a migration drops or renames a column before all old instances stop using it, old code fails. If code that requires a
new column is deployed before the column exists, new code fails. The migration plan must keep every intermediate state
valid.

## Deployment flow

Use this flow for changes that must not interrupt production traffic:

1. Create a migration that only adds compatible schema.
2. Apply this migration to production while the current application version is still running.
3. Deploy the new application version with a rolling update.
4. Verify that all instances and workers run the new version.
5. In a later release, apply cleanup migrations that remove old columns, indexes, tables, or compatibility code.

For Yii applications, run migrations with the same command you use in regular deployments, for example:

```shell
./yii migrate
```

Run migrations from a single deployment job or one dedicated console container. Do not let every rolling application
instance run migrations on startup.

## Adding a column

Adding a nullable column is usually compatible with old code:

```php
public function up(MigrationBuilder $b): void
{
    $cb = $b->columnBuilder();

    $b->addColumn('user', 'display_name', $cb::string());
}
```

Then deploy code that writes and reads `display_name`.

If the column must eventually be required:

1. Add it as nullable.
2. Deploy code that writes it for new and updated rows.
3. Backfill existing rows in batches.
4. Add a `NOT NULL` constraint in a later migration.

Do not add a `NOT NULL` column without a database default while old code still inserts rows without that column.

## Renaming a column

Renaming is not compatible because old code uses the old name and new code uses the new name. Use a multi-release
change instead:

1. Add the new column.
2. Backfill it from the old column.
3. Deploy code that writes both columns and reads the new column with a fallback to the old one.
4. Wait until all old code is gone.
5. Deploy code that uses only the new column.
6. Drop the old column in a later cleanup migration.

The same approach works for moving data to a different table.

## Changing a column type

Changing a column type in place may lock the table or break either the old or new code. Prefer a new column:

1. Add a column with the target type.
2. Backfill it in batches.
3. Deploy code that writes both columns.
4. Deploy code that reads the new column.
5. Drop the old column after all code uses the new one.

For small tables, an in-place type change may be acceptable. For production tables with traffic, verify locking behavior
on the exact database engine and version before applying it.

## Dropping columns and tables

Dropping is a cleanup step, not the first step:

1. Deploy code that no longer reads or writes the column or table.
2. Confirm that old application instances, workers, and scheduled commands are stopped.
3. Confirm that no external reporting or maintenance scripts depend on it.
4. Drop it in a separate migration.

This makes rollback safer. If you need to roll back application code before cleanup, the old schema is still available.

## Adding indexes and constraints

Indexes and constraints may be logically compatible but operationally risky because they can lock tables.

For indexes:

- use online index creation when the database supports it;
- for PostgreSQL, consider `CREATE INDEX CONCURRENTLY` from a migration or command that is not wrapped in a
  transaction;
- for MySQL and MariaDB, check whether the operation can use online DDL for your table and engine.

For constraints:

- clean invalid data before adding the constraint;
- add the constraint only after deployed code preserves it;
- for PostgreSQL, consider adding foreign keys and check constraints as `NOT VALID`, then validating them separately.

Keep long-running index creation and validation separate from unrelated schema changes so it is easier to monitor and
retry them.

## Data migrations

Data migrations that touch many rows should be safe to run while the application is live:

- make them idempotent so rerunning them does not corrupt data;
- process rows in small batches;
- avoid depending on current application service or entity logic because that logic changes over time;
- prefer forward-compatible values that both old and new code can handle;
- store progress when a backfill is too large for a single migration run.

For very large backfills, use a console command or background job after the schema migration. The schema migration should
prepare the database; the background process should move the data gradually.

## Reverting

In production rolling deployments, reverting a destructive migration is often harder than deploying a corrective
migration. Treat `down()` methods for destructive operations as a local-development convenience, not as the main
production rollback plan.

A practical rollback plan is:

- before cleanup, roll back code only because old schema is still present;
- after cleanup, deploy a new forward migration that restores the required structure or compatibility;
- restore from backup only when data was actually lost and no forward repair is possible.

## Checklist

Before applying a production migration, verify that:

- the current production code works after the migration;
- the new code works before and after all instances are updated;
- old workers and scheduled commands are covered;
- inserts and updates keep required columns valid in every deployment phase;
- long-running schema operations will not block production traffic unexpectedly;
- cleanup happens in a separate release after the rollout is complete.
