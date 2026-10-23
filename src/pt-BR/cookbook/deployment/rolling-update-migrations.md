# Aplicando migrations durante rolling updates

Rolling updates mantêm instâncias antigas e novas da aplicação rodando ao
mesmo tempo. Isso torna as mudanças no banco de dados mais delicadas do que
em um deploy em um único servidor: as duas versões da aplicação precisam
funcionar com o mesmo banco de dados enquanto o deploy está em andamento.

A regra segura é:

1. Aplique mudanças no banco de dados que sejam compatíveis com o código
   atual de produção.
2. Faça o deploy do código que passa a usar essas mudanças no banco de
   dados.
3. Remova estruturas obsoletas do banco de dados só depois que todas as
   instâncias antigas da aplicação tiverem saído.

Isso costuma ser chamado de padrão expand and contract. Primeiro expanda o
schema para que as duas versões possam usá-lo. Depois atualize o código da
aplicação. Por fim, contraia o schema em um deploy posterior.

## Por que isso importa

Durante um rolling update, as requisições podem ser atendidas por versões
diferentes da aplicação:

- código antigo, que não conhece o novo schema;
- código novo, que espera o novo schema;
- workers em segundo plano, que podem ficar atrás das instâncias web;
- comandos agendados, que podem rodar durante o deploy.

Se uma migration remove ou renomeia uma coluna antes que todas as instâncias
antigas parem de usá-la, o código antigo falha. Se o código que exige uma
coluna nova vai para produção antes de a coluna existir, o código novo
falha. O plano de migrations precisa manter válido cada estado
intermediário.

## Fluxo de deploy

Use este fluxo para mudanças que não podem interromper o tráfego de
produção:

1. Crie uma migration que apenas adiciona schema compatível.
2. Aplique essa migration em produção enquanto a versão atual da aplicação
   ainda está rodando.
3. Faça o deploy da nova versão da aplicação com um rolling update.
4. Verifique se todas as instâncias e workers rodam a nova versão.
5. Em uma release posterior, aplique as migrations de limpeza que removem
   colunas, índices, tabelas ou código de compatibilidade antigos.

Em aplicações Yii, rode as migrations com o mesmo comando que você usa nos
deploys normais, por exemplo:

```shell
./yii migrate
```

Rode as migrations a partir de um único job de deploy ou de um container de
console dedicado. Não deixe cada instância do rolling update rodar
migrations na inicialização.

## Adicionando uma coluna

Adicionar uma coluna que aceita nulo normalmente é compatível com o código
antigo:

```php
public function up(MigrationBuilder $b): void
{
    $cb = $b->columnBuilder();

    $b->addColumn('user', 'display_name', $cb::string());
}
```

Depois, faça o deploy do código que grava e lê `display_name`.

Se a coluna precisar ser obrigatória no futuro:

1. Adicione-a como coluna que aceita nulo.
2. Faça o deploy do código que a preenche em linhas novas e atualizadas.
3. Preencha as linhas existentes em lotes.
4. Adicione uma restrição `NOT NULL` em uma migration posterior.

Não adicione uma coluna `NOT NULL` sem um valor padrão no banco de dados
enquanto o código antigo ainda insere linhas sem essa coluna.

## Renomeando uma coluna

Renomear não é compatível, porque o código antigo usa o nome antigo e o
código novo usa o nome novo. Em vez disso, faça a mudança ao longo de várias
releases:

1. Adicione a nova coluna.
2. Preencha-a a partir da coluna antiga.
3. Faça o deploy do código que grava nas duas colunas e lê a nova coluna,
   com fallback para a antiga.
4. Espere até que todo o código antigo tenha saído.
5. Faça o deploy do código que usa só a nova coluna.
6. Remova a coluna antiga em uma migration de limpeza posterior.

A mesma abordagem funciona para mover dados para outra tabela.

## Mudando o tipo de uma coluna

Mudar o tipo de uma coluna no lugar pode travar a tabela ou quebrar o código
antigo ou o novo. Prefira uma coluna nova:

1. Adicione uma coluna com o tipo desejado.
2. Preencha-a em lotes.
3. Faça o deploy do código que grava nas duas colunas.
4. Faça o deploy do código que lê a nova coluna.
5. Remova a coluna antiga depois que todo o código usar a nova.

Em tabelas pequenas, mudar o tipo no lugar pode ser aceitável. Em tabelas de
produção com tráfego, verifique o comportamento de locks no motor e na
versão exatos do banco de dados antes de aplicar a mudança.

## Removendo colunas e tabelas

Remover é uma etapa de limpeza, não a primeira etapa:

1. Faça o deploy do código que não lê nem grava mais a coluna ou a tabela.
2. Confirme que as instâncias antigas da aplicação, os workers e os comandos
   agendados pararam.
3. Confirme que nenhum relatório externo ou script de manutenção depende
   dela.
4. Remova-a em uma migration separada.

Isso torna o rollback mais seguro. Se você precisar fazer rollback do código
da aplicação antes da limpeza, o schema antigo ainda está disponível.

## Adicionando índices e restrições

Índices e restrições podem ser logicamente compatíveis, mas arriscados na
operação, porque podem travar tabelas.

Para índices:

- use criação de índice online quando o banco de dados suportar;
- no PostgreSQL, considere `CREATE INDEX CONCURRENTLY` em uma migration ou
  comando que não esteja dentro de uma transação;
- no MySQL e no MariaDB, verifique se a operação pode usar online DDL para a
  sua tabela e o seu motor.

Para restrições:

- limpe os dados inválidos antes de adicionar a restrição;
- adicione a restrição só depois que o código em produção a respeitar;
- no PostgreSQL, considere adicionar chaves estrangeiras e check constraints
  como `NOT VALID` e validá-las separadamente depois.

Mantenha a criação de índices e as validações demoradas separadas de
mudanças de schema não relacionadas, para facilitar o monitoramento e novas
tentativas.

## Migrations de dados

Migrations de dados que mexem em muitas linhas precisam ser seguras para
rodar com a aplicação no ar:

- torne-as idempotentes, para que rodar de novo não corrompa os dados;
- processe as linhas em lotes pequenos;
- evite depender da lógica atual de serviços ou entidades da aplicação,
  porque essa lógica muda com o tempo;
- prefira valores compatíveis com o futuro, que tanto o código antigo quanto
  o novo consigam tratar;
- guarde o progresso quando um preenchimento for grande demais para uma
  única execução de migration.

Para preenchimentos muito grandes, use um comando de console ou um job em
segundo plano depois da migration de schema. A migration de schema deve
preparar o banco de dados; o processo em segundo plano deve mover os dados
aos poucos.

## Revertendo

Em deploys com rolling update em produção, reverter uma migration destrutiva
costuma ser mais difícil do que fazer o deploy de uma migration
corretiva. Trate os métodos `down()` de operações destrutivas como uma
conveniência para o desenvolvimento local, não como o principal plano de
rollback em produção.

Um plano de rollback prático é:

- antes da limpeza, faça rollback apenas do código, porque o schema antigo
  ainda existe;
- depois da limpeza, faça o deploy de uma nova migration que restaure a
  estrutura ou a compatibilidade necessária;
- restaure um backup só quando dados foram realmente perdidos e nenhum
  reparo por uma nova migration é possível.

## Checklist

Antes de aplicar uma migration em produção, verifique que:

- o código atual de produção funciona depois da migration;
- o código novo funciona antes e depois de todas as instâncias serem
  atualizadas;
- workers antigos e comandos agendados foram considerados;
- inserts e updates mantêm as colunas obrigatórias válidas em todas as fases
  do deploy;
- operações de schema demoradas não vão bloquear o tráfego de produção de
  forma inesperada;
- a limpeza acontece em uma release separada, depois que o rollout terminou.
