#016 - Resolução de falhas de segurança

Problemas de segurança normalmente são enviados por meio do [formulário de segurança](https://www.yiiframework.com/security).

Se um problema for relatado diretamente em uma página pública, como um problema de repositório ou um tópico de fórum, receba a mensagem
e exclua o problema. Agradeça ao usuário e indique o formulário de segurança para a próxima vez.

## Verificar

Verifique se o problema é válido. Solicite mais informações se necessário.

## Adicionar aviso de segurança

Crie um rascunho de comunicado de segurança do GitHub.

### Descubra a gravidade

1. Obtenha a pontuação CVSS usando a [calculadora NVD](https://nvd.nist.gov/vuln-metrics/cvss/v3-calculator).
2. Escolha a gravidade com base na [escala de classificação](https://www.first.org/cvss/specification-document#Qualitative-Severity-Rating-Scale).

### Dê crédito ao usuário

Pergunte ao usuário se ele deseja crédito por encontrar o problema. Em caso afirmativo, aponte para sua conta no GitHub.

## Solicite um número CVE

Quando estiver pronto, solicite um CVE.

## Prepare um patch

Prepare uma solicitação pull corrigindo o problema. O GitHub permite fazer isso em um fork privado.

## Espere até que o número CVE seja alocado

Geralmente leva vários dias.

## Liberar

- Mescle a solicitação de pull do patch antes de marcar o próximo lançamento do pacote.
- Publique avisos de segurança.
- Adicione o CVE [FriendsOfPHP/security-advisories](https://github.com/FriendsOfPHP/security-advisories).
   Veja [#488](https://github.com/FriendsOfPHP/security-advisories/pull/488) como exemplo.