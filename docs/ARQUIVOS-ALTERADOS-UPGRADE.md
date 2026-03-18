# Arquivos criados ou modificados — Upgrade pt-BR e UX

## Resumo

O projeto foi atualizado para **pt-BR**, com **hero de impacto**, **linha de métricas na home**, **animações de scroll** e **bloco de insights** destacado, superando o site competidor (centro-capoeira.vercel.app) em narrativa, interatividade e consistência visual.

---

## Arquivos criados

| Arquivo | Descrição |
|--------|-----------|
| `docs/ANALISE-COMPETIDOR-E-ESTRATEGIA.md` | Análise do competidor, extração de features, comparação e estratégia de upgrade |
| `docs/ARQUIVOS-ALTERADOS-UPGRADE.md` | Este arquivo: lista de arquivos criados/modificados |
| `src/app/directives/scroll-reveal.directive.ts` | Diretiva que revela elementos ao scroll (IntersectionObserver), adicionando classe `revealed` |

---

## Arquivos modificados

### Navegação e shell
- **`src/app/app.html`** — Links do menu em pt-BR: Início, Dashboard, Análise
- **`src/app/app.css`** — Transição suave nos links da nav e cantos arredondados
- **`src/index.html`** — `lang="pt-BR"` e título "Dashboard de Restauração da Floresta Amazônica"

### Estilos globais
- **`src/styles.css`** — Regras para `.scroll-reveal` e `.scroll-reveal.revealed` (animação de entrada)

### Página inicial (Home)
- **`src/app/pages/home/home.component.ts`** — Injeção de `RestorationService`, carregamento de dados para a linha de métricas, uso de `MetricCardComponent` e `ScrollRevealDirective`
- **`src/app/pages/home/home.component.html`** — Conteúdo em pt-BR; hero com tagline “Transformar a cultura da destruição em cultura da restauração”; CTAs “Explorar dados” e “Análise científica”; seção de métricas (área total, carbono, regiões, anos); seções Sobre, Tecnologias, Prévia, Análise; `appScrollReveal` nas seções
- **`src/app/pages/home/home.component.css`** — Estilos para `.hero-tagline` e `.stats-row`

### Dashboard
- **`src/app/pages/dashboard/dashboard-page.component.html`** — Títulos, filtros, tabela e seções em pt-BR (Filtros, Gráficos, Mapa das regiões, Tabela de dados; “Todos os anos”, “Todas as regiões”, “Limpar filtros”; cabeçalhos da tabela)
- **`src/app/pages/dashboard/dashboard-page.component.ts`** — Rótulos dos gráficos e títulos em pt-BR (área restaurada por ano, sequestro de carbono por ano; eixos “Ano”, “Hectares”); mensagem de erro em pt-BR

### Análise
- **`src/app/pages/analysis/analysis-page.component.ts`** — Rótulos dos gráficos e títulos em pt-BR (tendência de restauração, comparação por região); mensagem de erro em pt-BR
- **`src/app/pages/analysis/analysis-page.component.html`** — Títulos, descrições, “Principais insights”, texto do card de insight e links em pt-BR
- **`src/app/pages/analysis/analysis-page.component.css`** — Estilos para `.insight-card` e `.insight-lead` (bloco de insight destacado)

### Mapa
- **`src/app/components/amazon-map/amazon-map.component.ts`** — Textos do popup em pt-BR (Ano, Área restaurada, Carbono capturado)

---

## Estrutura final relevante

```
src/app/
  directives/
    scroll-reveal.directive.ts   (novo)
  components/
    metric-card/
    amazon-map/                  (popup pt-BR)
  pages/
    home/                        (hero, métricas, scroll reveal, pt-BR)
    dashboard/                   (pt-BR)
    analysis/                    (pt-BR, insight card)
  services/
  models/
docs/
  ANALISE-COMPETIDOR-E-ESTRATEGIA.md
  ARQUIVOS-ALTERADOS-UPGRADE.md
```

---

## Como executar

1. Backend: `cd backend && uvicorn main:app --reload`
2. Frontend: `cd frontend/amazonia-dashboard && npm start`
3. Acesse `http://localhost:4200` — interface em pt-BR, hero com tagline, métricas na home (quando a API responder), animações ao rolar e insights em destaque na análise.
