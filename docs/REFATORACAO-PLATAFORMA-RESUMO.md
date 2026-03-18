# Refatoração — Plataforma de Monitoramento Ambiental

## Resumo das mudanças

O projeto foi refatorado para se assemelhar a uma **plataforma científica de dados**, com identidade visual própria, mapa corrigido, seção "Sobre o Projeto" removida e nova hierarquia de seções.

---

## 1. Arquivos modificados

| Arquivo | Alterações |
|---------|------------|
| **`src/app/components/amazon-map/amazon-map.component.ts`** | Correção do mapa: uso de tiles **OpenStreetMap**; inicialização com `setTimeout(..., 50)` para o container ter dimensões; `invalidateSize()` após 100 ms; ID único do container; sinal `mapReady` para animação de entrada. |
| **`src/app/components/amazon-map/amazon-map.component.html`** | Wrapper com legenda no canto inferior esquerdo ("Regiões" / "● Sítios com dados de restauração"); classe `visible` quando mapa está pronto. |
| **`src/app/components/amazon-map/amazon-map.component.css`** | Altura fixa do container **450px**; `.map-wrapper` com `min-height: 450px`; transição de opacidade no mapa; estilos da legenda. |
| **`src/app/components/navbar/navbar.component.ts`** | Itens do menu atualizados: Início, Indicadores, Visualizações, Mapa, Dados, Insights. Removido "Sobre o Projeto". |
| **`src/app/pages/home/home.component.html`** | Nova estrutura: Hero → Painel de Indicadores (métricas + filtros) → Visualizações de Dados (gráficos) → Mapa Interativo → Exploração de Dados (tabela via `app-data-table`) → Insights e Tendências (dois cards). **Removida** a seção "Sobre o Projeto" / tecnologias. |
| **`src/app/pages/home/home.component.ts`** | Import do **DataTableComponent**. |
| **`src/app/pages/home/home.component.css`** | Layout diferenciado: `max-width: 1200px`; grid de 4 colunas para métricas e 2 para gráficos/insights; `filter-bar`, `metrics-grid`, `charts-row`, `insights-grid`; remoção de estilos de "Sobre"; mais espaçamento; botão `btn-ghost`. |
| **`src/styles.css`** | Paleta ajustada: verdes menos saturados, `--text-muted: #5c6d66`, `--border: #dde5e0`, `--bg-page: #f8faf8`, `--primary-bg` mais suave. |

---

## 2. Componentes novos criados

| Componente | Descrição |
|------------|-----------|
| **`src/app/components/data-table/data-table.component.ts`** | Componente reutilizável para tabela de dados de restauração. |
| **`src/app/components/data-table/data-table.component.html`** | Tabela com colunas Região, Ano, Área restaurada (ha), Carbono (tCO₂e); estados de carregando e vazio. |
| **`src/app/components/data-table/data-table.component.css`** | Card com bordas arredondadas, sombra leve e estilos da tabela. |

---

## 3. Como o problema do mapa foi corrigido

- **Tiles:** Troca de CARTO dark (`basemaps.cartocdn.com/dark_all/...`) por **OpenStreetMap** (`https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`), mais estável e evitando fundo cinza quando os tiles não carregam.  
- **Altura do container:** O container do mapa passou a ter **altura fixa de 450px** (no componente e no wrapper). O Leaflet precisa de dimensões explícitas para calcular a view e desenhar os tiles; com `min-height` apenas ou altura indefinida, o mapa pode aparecer cinza.  
- **Inicialização atrasada:** Uso de `setTimeout(() => this.initMap(), 50)` em `ngAfterViewInit` para que o container já esteja no DOM com tamanho definido antes de criar o `L.map()`.  
- **invalidateSize():** Chamada de `this.map.invalidateSize()` após 100 ms para forçar o Leaflet a recalcular o tamanho do container e redesenhar os tiles (útil após mudanças de layout ou exibição).  
- **ID único:** O container usa um ID único (sufixo aleatório) para evitar conflito quando há mais de uma instância do componente.  
- **Legenda:** Inclusão de uma legenda simples no canto inferior esquerdo do mapa e animação de opacidade quando o mapa está pronto.

---

## 4. Mudanças estruturais aplicadas

- **Hierarquia da página:**  
  1. Header fixo  
  2. Hero / Introdução  
  3. Painel de Indicadores (metric cards + filtros)  
  4. Visualizações de Dados (gráficos principais)  
  5. Mapa Interativo da Amazônia  
  6. Exploração de Dados (tabela filtrável)  
  7. Insights e Tendências (cards de insights)  
  8. Footer institucional  

- **Remoção:** Seção "Sobre o Projeto" e qualquer menção a "tecnologias usadas" na página principal; link "Sobre o Projeto" no menu da navbar.  

- **Design:** Layout mais próximo de um dashboard científico: grid de 4 colunas para indicadores, 2 colunas para gráficos e para insights; mais espaço em branco; paleta com verdes menos saturados e fundo mais neutro.  

- **Organização do frontend:** Criação do componente **data-table** em `components/data-table/`; uso desse componente na seção "Exploração de Dados". Estrutura mantida em `pages/home`, `components/` (navbar, footer, metric-card, chart-card, amazon-map, data-table), `services/` e `models/`.

---

## 5. Estrutura final de componentes

```
components/
  navbar/
  footer/
  metric-card/
  chart-card/
  amazon-map/   (mapa corrigido + legenda)
  data-table/   (novo)
pages/
  home/         (página única com nova ordem de seções)
services/
  restoration.service
  filter.service
models/
  restoration.model
```

O resultado é uma plataforma de monitoramento com navegação clara, dados exploráveis, mapa funcional com OpenStreetMap e visual mais neutro e profissional, sem a seção de tecnologias e com identidade própria em relação ao site de referência.
