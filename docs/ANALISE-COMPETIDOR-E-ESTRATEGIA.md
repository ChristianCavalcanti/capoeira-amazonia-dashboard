# Análise do site competidor e estratégia de upgrade

## 1. Análise do site competidor (centro-capoeira.vercel.app)

### Estrutura do layout
- **Cabeçalho** com nome do projeto e subtítulo institucional
- **Hero** com frase de impacto e dois CTAs (Explorar Dados / Conheça o Centro)
- **Linha de métricas** (Pesquisadores, Instituições, Sítios de Estudo, Investimento)
- **Seção Mapa** (Amazônia Legal) com filtros por tipo de ecossistema e legenda
- **Seção Indicadores** com métricas em tempo real, seletor de período e gráficos (cobertura vegetal, estoque de carbono, distribuição por ecossistema)
- **Bloco de Insight** destacado com dado principal e comparações
- **Catálogo de Dados** (tabela de bases com filtros por tipo)
- **Sobre o Centro** com citação, pilares (Ciência, Comunidades, Políticas), coordenação e instituições parceiras

### Componentes de UI
- Cards de métricas com valor grande e subtítulo
- Mapa interativo (Leaflet) com marcadores e popups
- Gráficos com títulos e eixos claros
- Filtros (dropdowns, chips de tipo)
- Tabela de datasets com colunas (Dataset, Ano, Tipo, Status)
- Cards de equipe (foto, nome, cargo, instituição)
- Lista de parceiros

### Navegação
- Links para seções da página (Explorar Dados, Conheça o Centro) e provavelmente menu fixo

### Animações e interatividade
- Transições suaves em elementos interativos
- Possível revelação ao scroll (seções entrando na viewport)

### Narrativa
- Missão clara no hero → explorar dados → métricas em tempo real → insight científico → dados abertos → sobre/credibilidade

### Design visual
- Paleta sóbria, provavelmente tons verdes/neutros
- Tipografia hierárquica (títulos, subtítulos, corpo)
- Uso de cards com bordas/sombras leves
- Layout em grid responsivo

### Pontos fortes do competidor
- Narrativa clara (problema → solução → dados → credibilidade)
- Mapa interativo com filtros e legenda
- Métricas em destaque e indicadores “em tempo real”
- Insight científico destacado em bloco
- Catálogo de dados abertos
- Seção “sobre” com coordenação e parceiros (confiança)

---

## 2. Extração de features

| Feature | Descrição | Por que fortalece o site |
|--------|-----------|---------------------------|
| Hero section | Título + subtítulo + CTAs | Primeira impressão e direcionamento claro |
| Linha de métricas | Números em cards no topo | Mostra escala e credibilidade em números |
| Seções bem delimitadas | Títulos H2, blocos visuais | Hierarquia e escaneabilidade |
| Cards | Métricas, insights, equipe | Organização e ênfase visual |
| Mapa interativo | Leaflet + marcadores + popups | Exploração espacial dos dados |
| Filtros | Ano, região, tipo | Exploração guiada e sensação de controle |
| Gráficos | Barras, linhas, possivelmente pizza | Dados interpretáveis rapidamente |
| Bloco de insight | Destaque para um achado | Narrativa científica e confiança |
| Tabela de dados | Catálogo ou dados brutos | Transparência e reuso |
| Layout responsivo | Grid e breakpoints | Uso em desktop e mobile |
| Animações suaves | Entrada de seções / hover | Sensação de produto moderno |

---

## 3. Comparação com o projeto atual

| Aspecto | Competidor | Projeto Amazonia (antes do upgrade) |
|---------|------------|-------------------------------------|
| Idioma | pt-BR | EN |
| Hero | Frase de impacto + 2 CTAs | Título + 2 botões |
| Métricas no topo | Sim (4 cards) | Sim (dashboard) |
| Mapa | Sim, com filtros e legenda | Sim, sem legenda de tipos |
| Gráficos | Vários + seletor de período | 2 gráficos + filtros ano/região |
| Insight destacado | Bloco dedicado | Texto na página de análise |
| Catálogo de dados | Tabela de bases | Tabela de registros de restauração |
| Sobre / credibilidade | Seção “Sobre” + parceiros | Menos ênfase na landing |
| Animações | Provável scroll reveal | Poucas |
| Narrativa | Hero → dados → insight → sobre | Menos guiada na home |

**O que faltava no nosso projeto**
- Interface 100% em **pt-BR**
- Hero com **frase de impacto** no estilo “cultura da restauração”
- **Linha de métricas na home** (totais gerais antes de ir ao dashboard)
- **Animações** (entrada de seções, transições)
- **Bloco de insight** mais destacado na análise
- **Refinamento visual**: sombras, cantos arredondados, tipografia e hierarquia mais claras

---

## 4. Estratégia de upgrade

Objetivo: superar o competidor como **plataforma científica de monitoramento ambiental**, mantendo todas as funcionalidades atuais.

1. **Idioma**  
   - Todo o conteúdo e UI em **pt-BR** (nav, home, dashboard, análise, gráficos, tabela, mapa, erros).

2. **Home (landing)**  
   - Hero com frase de impacto e subtítulo institucional.  
   - Dois CTAs: “Explorar dados” (dashboard) e “Análise científica” (análise).  
   - Linha de métricas no topo (área total, carbono total, regiões, anos) usando dados da API.  
   - Seções: explicação do projeto, tecnologias, prévia do dashboard, CTA para análise.  
   - Animações de entrada (fade-in / slide) nas seções.

3. **Dashboard**  
   - Manter: cards de métricas, filtros (ano/região), gráficos, mapa, tabela.  
   - Traduzir todos os rótulos e mensagens para pt-BR.  
   - Melhorar sombras e cantos dos cards.

4. **Análise**  
   - Títulos e descrições em pt-BR.  
   - Bloco “Principais insights” bem destacado (card ou seção com fundo diferenciado).  
   - Gráficos com títulos e eixos em pt-BR.

5. **Design**  
   - Tema ambiental: fundo verde escuro, destaques em verde claro, texto neutro.  
   - Sombras suaves, cards arredondados, grid consistente, tipografia clara.  
   - Transições suaves em hover e ao revelar seções.

6. **Arquitetura**  
   - Manter estrutura: `pages/`, `components/`, `services/`, `models/`.  
   - Reaproveitar `metric-card`, `amazon-map`, serviços e modelos existentes.

---

## 5. Resultado esperado

- Site **totalmente em pt-BR**, com narrativa clara (hero → métricas → explorar → análise → insights).  
- **Visual mais forte** que o competidor: animações, métricas na home, blocos de insight destacados.  
- **Mais interativo**: filtros, mapa e gráficos já existentes, agora com rótulos e contexto em português.  
- **Mais informativo**: insights científicos em destaque e descrições nas seções de análise.
