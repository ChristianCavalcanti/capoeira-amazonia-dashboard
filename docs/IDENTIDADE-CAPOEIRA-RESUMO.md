# Identidade visual CAPOEIRA e melhorias — Resumo

## 1. Paleta de cores aplicada

Com base em identidade institucional ambiental (não foi possível acessar o Instagram oficial; a paleta foi definida para projetos de restauração e comunicação do CAPOEIRA):

| Uso | Variável | Cor | Aplicação |
|-----|----------|-----|-----------|
| Principal | `--primary` | #1a4d3e | Header, botões, links, ícones, gráficos, valores em destaque |
| Principal clara | `--primary-light` | #2d6a54 | Hover de botões |
| Principal escura | `--primary-dark` | #0f3329 | (reserva) |
| Fundo primário | `--primary-bg` | rgba(26,77,62,0.08) | Fundos de destaque, ícones em cards |
| Secundária | `--secondary` | #4a7c59 | (reserva) |
| Destaque | `--accent` | #b8860b | (reserva para CTAs secundários) |
| Fundo da página | `--bg-page` | #fafbf9 | Body |
| Fundo de cards | `--bg-card` | #ffffff | Cards, tabelas, popups |
| Texto | `--text` | #1a2e26 | Títulos e corpo |
| Texto secundário | `--text-muted` | #5a6d66 | Legendas, descrições |
| Borda | `--border` | #dce4e0 | Bordas de cards e inputs |
| Footer | `--footer-bg` | #1a4d3e | Fundo do rodapé |

**Onde foi aplicada:** `styles.css` (variáveis globais); navbar, footer, hero, highlight-card, metric-card, chart-card, data-table, amazon-map (via `var(--primary)` etc.); cores dos gráficos em `home.component.ts` (RGB 26,77,62).

---

## 2. Símbolo CAPOEIRA e favicon

- **Componente `app-logo-capoeira`:** SVG em forma de folha (referência à vegetação capoeira), cor `currentColor` (herda `--primary`). Usado na navbar (tamanho 36px) e no hero (56px).
- **Favicon:** `public/favicon.svg` com o mesmo símbolo em #1a4d3e. Referência em `index.html`: `<link rel="icon" type="image/svg+xml" href="favicon.svg">`.
- **Arquivos:** `src/app/components/logo-capoeira/logo-capoeira.component.ts`, `public/favicon.svg`, `src/index.html`.

---

## 3. LinkedIn

- **URL:** https://www.linkedin.com/company/centro-capoeira/posts/?feedView=all
- **Header:** Ícone do LinkedIn (SVG) no fim do menu de navegação, link abrindo em nova aba.
- **Footer:** Link “LinkedIn” com ícone na seção Contato.
- **Arquivos:** `navbar.component.html`, `navbar.component.ts` (constante `LINKEDIN_URL`), `footer.component.html`, `footer.component.css` (classe `.footer-linkedin`).

---

## 4. Arquivos modificados

| Arquivo | Alterações |
|---------|------------|
| `src/styles.css` | Nova paleta CAPOEIRA (variáveis :root). |
| `src/index.html` | Favicon apontando para `favicon.svg`. |
| `src/app/components/navbar/navbar.component.ts` | Logo CAPOEIRA, link LinkedIn, menu “Destaques”. |
| `src/app/components/navbar/navbar.component.html` | Logo (app-logo-capoeira) + texto; ícone LinkedIn no nav. |
| `src/app/components/navbar/navbar.component.css` | Estilo do logo-area (flex com ícone), `.nav-icon-link`, cores com var(--primary). |
| `src/app/components/footer/footer.component.html` | Link LinkedIn com ícone na seção Contato. |
| `src/app/components/footer/footer.component.css` | Estilos `.footer-linkedin`. |
| `src/app/components/amazon-map/amazon-map.component.ts` | `setTimeout` 150 ms para init; `invalidateSize()` após 250 ms. |
| `src/app/components/amazon-map/amazon-map.component.css` | Altura do mapa 500px; `min-height: 500px` no host. |
| `src/app/pages/home/home.component.ts` | `LogoCapoeiraComponent`, `HighlightCardComponent`; removido `MetricCardComponent`; `restorationTrend` computed; cores dos gráficos em RGB(26,77,62). |
| `src/app/pages/home/home.component.html` | Hero com logo + título + descrição + um botão; seção “Painel de Destaques” (id destaque) com 4 `app-highlight-card` (área, carbono, regiões, tendência) e barra de filtros. |
| `src/app/pages/home/home.component.css` | `.hero-logo`, `.destaques-grid`, remoção de `.hero-actions`/`.metrics-grid`; ajustes de espaçamento e sombra do botão. |

---

## 5. Componentes novos

| Componente | Descrição |
|------------|-----------|
| `src/app/components/logo-capoeira/logo-capoeira.component.ts` | Símbolo em SVG (folha), input `size`, cor via `currentColor`. |
| `src/app/components/highlight-card/highlight-card.component.ts` | Card de destaque com ícone (area, carbon, regions, trend), valor grande, título e subtítulo. |
| `src/app/components/highlight-card/highlight-card.component.html` | Template do card com ícones SVG inline. |
| `src/app/components/highlight-card/highlight-card.component.css` | Card com bordas arredondadas, sombra, hover e ícone em `primary-bg`. |
| `public/favicon.svg` | Favicon com o símbolo CAPOEIRA. |

---

## 6. Como o mapa foi corrigido

- **Altura:** Container e wrapper do mapa com altura fixa **500px** e `min-height: 500px` no `:host`, para o Leaflet calcular corretamente a view e desenhar os tiles.
- **Inicialização:** `setTimeout(() => this.initMap(), 150)` em `ngAfterViewInit` para o container estar no DOM com dimensões estáveis antes de criar o mapa.
- **Redimensionamento:** `map.invalidateSize()` após **250 ms** para o Leaflet recalcular o tamanho e preencher o container (evita faixas cinza ou tiles cortados).
- **Tiles:** Continuação do uso de OpenStreetMap (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`) para carregamento estável.
- **Animação:** Classe `.visible` e transição de opacidade quando o mapa está pronto.

---

## 7. Mudanças estruturais

- **Hero:** Uma única área de introdução com logo CAPOEIRA, título “Plataforma de Dados para Restauração da Amazônia”, descrição curta e um botão “Explorar dados” (scroll para #destaques).
- **Painel de Destaques (ex-Indicadores):** Seção com id `destaques`; 4 cards grandes com ícones (área restaurada total, carbono sequestrado, regiões monitoradas, **tendência de restauração**). Cada card usa `HighlightCardComponent` com ícone, número em destaque e legenda. Abaixo, a mesma barra de filtros (ano/região).
- **Tendência:** Computada no `HomeComponent` (comparação entre primeiro e último ano da série em área restaurada); exibida como “+X%”, “-X%”, “Estável” ou “Crescente”.
- **Menu:** Item “Indicadores” renomeado para “Destaques” e link para `#destaques`.
- **Remoção:** Uso de `MetricCardComponent` na home (substituído por `HighlightCardComponent` nos destaques).

O site passa a usar de forma consistente a identidade CAPOEIRA (verde institucional, símbolo, favicon), o link do LinkedIn no header e no footer, e um mapa com altura e inicialização ajustadas para carregar os tiles corretamente.
