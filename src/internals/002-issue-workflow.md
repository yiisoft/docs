# 002 — Issue workflow

The process of handing incoming issues is the following:

![Issue workflow schema](/images/internals/002-issue-workflow.svg)

## Roles

We've many roles:

- Process managers - initially triage issues and manage labels.
- Decision makers - participate in discussions moving them to resolutions.
- Bug hunters - verifying bugs.
- Contributors - create code for pull requests.
- Code reviewers - review pull requests.

A single person may take one or more roles in the issue-resolving process.

## Labels

We label issues to mark many things: current status, issue type,
component affected. Status labels speak for themselves.

## Milestones

Issues aren't assigned to milestones unless they're critical or there is
a likely good pull request exists.
