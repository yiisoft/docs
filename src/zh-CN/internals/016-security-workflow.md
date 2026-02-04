# 016 — 安全工作流程

安全问题通常通过 [安全表单](https://www.yiiframework.com/security) 发送。

如果问题直接报告到公共页面（如仓库 issue 或论坛主题），请获取消息
并删除该 issue。感谢报告者，并指出下次使用安全表单。

## 验证

验证问题是否有效。如果需要，请求更多信息。

## 添加安全公告

创建一个 GitHub 安全公告草稿。

### 确定严重程度

1. 使用 [NVD 计算器](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator) 获取
   CVSS 分数。
2. 根据
   [评级量表](https://www.first.org/cvss/specification-document#Qualitative-Severity-Rating-Scale)
   选择严重程度。

### 给予报告者荣誉

询问报告者是否希望因发现问题而获得荣誉。如果是，请指向其 GitHub 账户。

## 请求 CVE 编号

准备好后，请求一个 CVE。

## 准备补丁

准备一个修复问题的 pull request。GitHub 允许在私有 fork 中执行此操作。

## 等待 CVE 编号分配

通常需要几天时间。

## 发布

- 在标记下一个包发布之前合并补丁 pull request。
- 发布安全公告。
- 将 CVE 添加到
  [FriendsOfPHP/security-advisories](https://github.com/FriendsOfPHP/security-advisories)。参见
  [#488](https://github.com/FriendsOfPHP/security-advisories/pull/488) 作为示例。
