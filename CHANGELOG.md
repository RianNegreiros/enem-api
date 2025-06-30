# Changelog

## [2.0.0] - 30-06-2025

### Adicionado

-   **API Versão 2 (`/v2`):** Introduzida uma nova versão da API para suportar novas funcionalidades e evitar quebras de compatibilidade para usuários existentes.
-   **Suporte para Exames de "Segunda Aplicação":** A API agora pode servir questões dos exames de "segunda aplicação".
-   **Novo Identificador de Exame:** Os exames na `v2` agora são identificados por um `id` único em formato de string (ex: `enem-2017-segunda-aplicacao`) em vez de apenas o ano. Isso permite múltiplos exames do mesmo ano.
-   **Lógica Versionada:** A lógica de negócio para a `v2` agora está isolada dentro do diretório `app/v2/` para garantir que não interfira com a `v1`.
-   **Arquivo de Dados Versionado:** Um novo arquivo `public/exams.v2.json` foi adicionado para servir como fonte de dados para a API `v2`.

### Alterado

-   O endpoint `/v2/exams/{id}` agora espera um `id` de exame em formato de string em vez de um ano numérico.

### Corrigido

-   A API agora é capaz de lidar com múltiplos exames do mesmo ano sem conflitos.
-   Corrigido um bug no endpoint `/v2/exams/{id}` que impedia a busca de detalhes de exames. A busca agora é feita pelo diretório correto no sistema de arquivos.

## [1.0.0]

-   Lançamento inicial da API.
