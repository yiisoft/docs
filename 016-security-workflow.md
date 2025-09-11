# 016 — Security workflow

Security issues are typically sent via [a security form](https://www.yiiframework.com/security).

If an issue is reported directly to a public page such as a repository issue or a forum topic, get the message
and delete the issue. Say thanks to the reporter and point to the security form for next time.  

## Verify

Verify that the issue is valid. Request more information if needed.

## Add security advisory

Create a draft GitHub security advisory.

### Find out severity

1. Get CVSS score using [NVD calculator](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator).
2. Choose severity based on the [rating scale](https://www.first.org/cvss/specification-document#Qualitative-Severity-Rating-Scale).

### Give credit to the reporter

Ask the reporter if he wants a credit for finding the issue. If so, point to his GitHub account.

## Request a CVE number

When you're ready, request a CVE.

## Prepare a patch

Prepare a pull request fixing the issue. GitHub allows doing it in a private fork.

## Wait till the CVE number is allocated 

It usually takes several days.

## Release

- Merge the patch pull request right before tagging the next package release.
- Publish security advisory.
- Add CVE to [FriendsOfPHP/security-advisories](https://github.com/FriendsOfPHP/security-advisories).
  See [#488](https://github.com/FriendsOfPHP/security-advisories/pull/488) as an example.
