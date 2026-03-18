# Melhorias UX/UI — Resumo de implementação

## Arquivos criados

| Arquivo | Descrição |
|---------|------------|
| `src/app/components/navbar/navbar.component.ts` | Componente da navbar fixa com logos e menu |
| `src/app/components/navbar/navbar.component.html` | Template: logo CAPOEIRA + subtítulo, botões do menu (Início, Dashboard, Mapa, Análises, Dados, Sobre o Projeto) |
| `src/app/components/navbar/navbar.component.css` | Estilos: fixo, translúcido com blur, sombra, menu responsivo (hambúrguer em mobile) |
| `src/app/components/footer/footer.component.ts` | Componente do rodapé institucional |
| `src/app/components/footer/footer.component.html` | Conteúdo: CAPOEIRA, Contato, Financiamento (CNPq, MCTI, FNDCT), logos (Embrapa, CNPq, MCTI), copyright |
| `src/app/components/footer/footer.component.css` | Layout em colunas, tipografia e espaçamento institucional |
| `src/app/components/chart-card/chart-card.component.ts` | Componente reutilizável para envolver gráficos |
| `src/app/components/chart-card/chart-card.component.html` | Card com título opcional e `<ng-content>` para o gráfico |
| `src/app/components/chart-card/chart-card.component.css` | Card com bordas arredondadas, sombra suave e borda |
| `docs/MELHORIAS-UX-UI-RESUMO.md` | Este arquivo |

---

## Arquivos modificados

| Arquivo | Alterações |
|---------|------------|
| `src/app/app.html` | Substituição da nav antiga por `<app-navbar />` e inclusão de `<app-footer />` após o `<router-outlet />` |
| `src/app/app.ts` | Import de `NavbarComponent` e `FooterComponent`; remoção de `RouterLink` e `RouterLinkActive` |
| `src/app/app.css` | Remoção dos estilos da nav antiga; uso de variáveis de cor (`--bg-page`) e fundo neutro |
| `src/app/app.routes.ts` | Rotas reduzidas a uma única rota `''` → `HomeComponent`; removidas rotas `/dashboard` e `/analysis` |
| `src/styles.css` | Nova paleta (variáveis CSS), `scroll-behavior: smooth`, `scroll-margin-top` nas seções para compensar navbar fixa, estilos do scroll-reveal |
| `src/app/pages/home/home.component.ts` | Lógica unificada: dados, filtros, gráficos (área e carbono), métodos de filtro e `scrollToSection`; imports de `ChartCardComponent`, `BaseChartDirective`, `AmazonMapComponent`, etc. |
| `src/app/pages/home/home.component.html` | Página única com seções: Hero (#inicio), Dashboard (#dashboard), Mapa (#mapa), Análises (#analises), Dados (#dados), Sobre (#sobre); uso de `app-chart-card`, métricas, filtros, tabela e botões com scroll suave |
| `src/app/pages/home/home.component.css` | Novos estilos com paleta (variáveis), seções, hero, métricas, filtros, grid de gráficos, insight card, tabela e sobre; responsividade |
| `src/app/components/metric-card/metric-card.component.css` | Cores atualizadas para o novo tema (fundo branco, borda e sombra suaves, verde primário no valor) |
| `src/app/components/amazon-map/amazon-map.component.css` | Popup e container do mapa com cores do novo tema (fundo claro, borda e sombra) |

---

## Melhorias de UX/UI aplicadas

1. **Header fixo (navbar)**  
   - Navbar fixa no topo com fundo translúcido e blur.  
   - Logo “CAPOEIRA” e subtítulo “Centro Avançado em Pesquisas Socioecológicas…”.  
   - Menu: Início, Dashboard, Mapa, Análises, Dados, Sobre o Projeto, com scroll suave para as seções.  
   - Sombra leve e layout responsivo com menu hambúrguer em mobile.

2. **Paleta de cores**  
   - Verde principal mais suave (`#2d6a4f`), verdes secundários claros (`#95d5b2`, `#b7e4c7`).  
   - Fundo neutro (`#f5f7f5`), cards brancos, texto escuro (`#1b4332`) e texto secundário (`#52796f`).  
   - Contraste adequado e tema alinhado a plataformas ambientais/científicas.

3. **Seções principais**  
   - **Hero:** Título de impacto, subtítulo e CTAs “Explorar dados” e “Ver análises” com scroll para Dashboard e Análises.  
   - **Dashboard:** Métricas, filtros (ano/região), dois gráficos em cards.  
   - **Mapa:** Mapa interativo da Amazônia com marcadores.  
   - **Análises:** Bloco “Principais insights” em card.  
   - **Dados:** Tabela de área restaurada e carbono.  
   - **Sobre:** Texto do projeto e tecnologias.  
   - Cada seção com `id` para âncoras e `scroll-margin-top` para não ficar atrás da navbar.

4. **Footer institucional**  
   - Conteúdo solicitado: CAPOEIRA, Contato (e-mail, Belém, @centrocapoeira), Financiamento (CNPq, MCTI, FNDCT), logos Embrapa/CNPq/MCTI e copyright.  
   - Layout em colunas e estilo institucional.

5. **Layout e componentes**  
   - Grid responsivo para métricas e gráficos.  
   - Componente `chart-card` para gráficos com bordas arredondadas e sombra.  
   - Espaçamento consistente entre seções e dentro de cards.

6. **Tipografia e interação**  
   - Hierarquia clara (títulos de seção, descrições, labels).  
   - Botões e links com transições suaves.  
   - Scroll suave (`scroll-behavior: smooth` e `scrollIntoView({ behavior: 'smooth' })`).

7. **Responsividade**  
   - Navbar com menu colapsável em telas pequenas.  
   - Métricas e gráficos em coluna única em mobile; filtros empilhados; botões em largura total quando adequado.

8. **Estrutura do projeto**  
   - `components/`: navbar, footer, metric-card, chart-card, amazon-map.  
   - `pages/home`: página única com todas as seções.  
   - `services/` e `models/` mantidos.

O resultado é um site de página única, mais profissional e institucional, com navegação por seções, paleta equilibrada e footer alinhado ao Centro CAPOEIRA.
