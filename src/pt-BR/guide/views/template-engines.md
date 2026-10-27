# Template engines

O Yii3 suporta várias template engines por meio de um sistema flexível de
renderers. Por padrão, o PHP é usado como template engine, mas você pode
adicionar suporte a outras engines como Twig e
[Blade](https://github.com/lee-to/yii-blade), ou criar seus próprios
renderers.

Os templates PHP foram descritos na seção "[View](view.md)" do guia.

## Template engine Twig

O Twig é uma template engine moderna, com uma sintaxe mais amigável para
designers. Para usar o Twig na sua aplicação Yii3, instale a extensão do
Twig.

```bash
composer require yiisoft/view-twig
```

Agora você pode usar templates `.twig`. Por exemplo,
`views/site/about.twig`:

```twig
{# Dicas de tipo das variáveis para suporte na IDE #}
{# @var user \App\Entity\User #}
{# @var posts \App\Entity\Post[] #}

<div class="user-profile">
    <h1>{{ user.name }}</h1>
    <p>Email: {{ user.email }}</p>
    
    {% if posts is not empty %}
        <h2>Recent Posts</h2>
        <ul class="posts">
            {% for post in posts %}
                <li>
                    <h3>{{ post.title }}</h3>
                    <p>{{ post.excerpt }}</p>
                    <time>{{ post.publishedAt|date('F j, Y') }}</time>
                </li>
            {% endfor %}
        </ul>
    {% else %}
        <p>No posts available.</p>
    {% endif %}
</div>
```

### Recursos do Twig

**Escape automático**: o Twig escapa as variáveis automaticamente para o contexto HTML:

```twig
{# Escapado automaticamente #}
<h1>{{ title }}</h1>

{# Saída bruta (use com cuidado) #}
<div>{{ content|raw }}</div>
```

**Filtros e funções**: o Twig oferece muitos filtros e funções nativos:

```twig
{# Formatação de data #}
<time>{{ post.createdAt|date('Y-m-d H:i') }}</time>

{# Manipulação de strings #}
<p>{{ description|truncate(100) }}</p>

{# Geração de URLs #}
<a href="{{ path('user.profile', {'id': user.id}) }}">Profile</a>
```

**Herança de templates**: o Twig suporta herança de templates:

**views/layout/main.twig**
```twig
<!DOCTYPE html>
<html>
<head>
    <title>{% block title %}Default Title{% endblock %}</title>
</head>
<body>
    <main>
        {% block content %}{% endblock %}
    </main>
</body>
</html>
```

**views/site/about.twig**
```twig
{% extends "layout/main.twig" %}

{% block title %}About Us{% endblock %}

{% block content %}
    <h1>About Our Company</h1>
    <p>Welcome to our website!</p>
{% endblock %}
```

### Renderizando templates Twig

Use templates Twig da mesma forma que templates PHP:

```php
// No seu controller
public function about(): ResponseInterface
{
    return $this->viewRenderer->render('about.twig', [
        'user' => $this->getCurrentUser(),
        'posts' => $this->getRecentPosts(),
    ]);
}
```

## Template engines personalizadas

Você pode criar template engines personalizadas implementando a
`TemplateRendererInterface`:

```php
<?php

declare(strict_types=1);

namespace App\View;

use Yiisoft\View\TemplateRendererInterface;

final class MarkdownRenderer implements TemplateRendererInterface
{
    public function __construct(
        private MarkdownParserInterface $parser,
    ) {}

    public function render(string $template, array $parameters = []): string
    {
        $content = file_get_contents($template);
        
        // Substitui os placeholders pelos parâmetros
        foreach ($parameters as $key => $value) {
            $content = str_replace("{{$key}}", (string) $value, $content);
        }
        
        return $this->parser->parse($content);
    }
}
```

Registre o seu renderer personalizado:

```php
use Yiisoft\Container\Reference;

// Na configuração
'yiisoft/view' => [
    'renderers' => [
        'md' => Reference::to(App\View\MarkdownRenderer::class),
    ],
],
```

Agora você pode usar arquivos de template `.md`:

**views/content/help.md**
```markdown
# Help: {{title}}

Welcome, {{username}}!

This is a Markdown template with **bold** and *italic* text.

- Feature 1
- Feature 2
- Feature 3
```

## Escolhendo a template engine certa

**Use templates PHP quando:**
- Você precisa do máximo de flexibilidade e desempenho
- Seu time está à vontade com PHP
- Você quer aproveitar o conhecimento de PHP que já tem
- Você precisa de lógica complexa nos templates (embora isso deva ser minimizado)

**Use templates Twig quando:**
- Você quer uma separação mais rígida entre lógica e apresentação
- Você trabalha com designers que preferem uma sintaxe mais limpa
- Você precisa de escape automático e recursos de segurança
- Você quer herança de templates e recursos avançados

**Use templates personalizados quando:**
- Você tem requisitos específicos que o PHP ou o Twig não atendem
- Você trabalha com formatos de conteúdo especializados
- Você precisa integrar com sistemas de template externos

## Boas práticas

1. **Mantenha os templates simples**: leve a lógica complexa para
   controllers ou serviços
2. **Sempre escape a saída**: evite ataques XSS escapando as variáveis
   corretamente
3. **Use nomes significativos**: dê nomes claros aos seus templates e
   variáveis
4. **Organize os templates**: agrupe templates relacionados em subdiretórios
5. **Documente as variáveis**: sempre adicione dicas de tipo para um suporte
   melhor da IDE
6. **Evite lógica de negócio**: mantenha a lógica de negócio em models e
   serviços
