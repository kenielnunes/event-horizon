# Event Processing Platform

Uma plataforma resiliente para ingestão, processamento e reação a eventos distribuídos. Construída com foco em observabilidade, recuperação de falhas e regras dinâmicas.

## 🚀 Visão Geral da Arquitetura

O sistema foi desenhado seguindo o padrão **Producer-Consumer** desacoplado para garantir que picos de ingestão não afetem a estabilidade do processamento.

### Componentes

1.  **Ingestion API (Node.js/Express):**
    * Responsável apenas por receber o evento, validar estrutura básica, persistir o estado `RECEIVED` e enfileirar.
    * **Design Decision:** Retorna `202 Accepted` imediatamente para baixa latência.
2.  **Event Queue (Redis/BullMQ):**
    * Atua como buffer de persistência temporária e garante retentativas automáticas (Backoff Exponencial) para falhas transientes.
3.  **Worker Engine (Node.js):**
    * Processa eventos de forma assíncrona.
    * Avalia regras dinâmicas (armazenadas no DB) contra o payload do evento.
    * Executa ações (Webhooks, Emails) via padrão **Strategy**.
4.  **Operational Console (Next.js):**
    * Interface para operadores visualizarem o fluxo, diagnosticarem falhas (via Timeline de Logs) e executarem **Replay Manual**.

---

## 🛠️ Stack Tecnológica

* **Backend:** Node.js, TypeScript, Express.
* **Database:** PostgreSQL (Persistência) + Prisma ORM.
* **Queue/Cache:** Redis + BullMQ.
* **Frontend:** Next.js (App Router), Shadcn/UI, React Query, TailwindCSS.
* **Infra:** Docker Compose.

---

## ⚡ Como Rodar

### Pré-requisitos
* Docker & Docker Compose
* Node.js v18+ (para desenvolvimento local fora do container)

### Passo a Passo

1.  **Subir a Infraestrutura (Banco e Redis):**
    ```bash
    docker-compose up -d
    ```

2.  **Configurar o Backend:**
    ```bash
    cd backend
    cp .env.example .env
    npm install
    npx prisma migrate dev --name init # Cria as tabelas
    npx prisma db seed               # Popula regras de teste
    ```

3.  **Iniciar os Serviços (Em terminais separados):**
    * Terminal 1 (API): `npm run dev:api`
    * Terminal 2 (Worker): `npm run dev:worker`

4.  **Iniciar o Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  Acesse o Console Operacional em: `http://localhost:3000` (ou porta configurada).

---

## 🧠 Decisões Técnicas e Trade-offs

### 1. BullMQ (Redis) vs RabbitMQ/Kafka
Optei pelo **BullMQ** pela simplicidade operacional e integração nativa com o ecossistema Node.js.
* **Trade-off:** Em escala massiva com múltiplos microserviços consumidores (Fan-out), RabbitMQ ou Kafka seriam mais adequados. Para o escopo atual (1:1 producer/consumer), Redis reduz a complexidade de infraestrutura mantendo garantias de entrega "At-least-once".

### 2. Motor de Regras (JSON Logic)
Implementei um avaliador determinístico de regras (`src/core/engine.ts`) ao invés de `eval()` ou execução dinâmica de código.
* **Motivo:** Segurança. Permitir execução de código arbitrário exporia o sistema a RCE (Remote Code Execution).
* **Limitação:** A expressividade das regras é limitada aos operadores implementados (`eq`, `gt`, `contains`).

### 3. Action Strategy Pattern
As ações (Email, Webhook, etc.) são implementadas via **Strategy Pattern** e instanciadas por um **Factory**.
* **Benefício:** Permite adicionar novos tipos de ações (ex: Slack, SMS) sem alterar a lógica core de processamento (`Open/Closed Principle`).

---

## ❓ Respostas ao Desafio (Perguntas Obrigatórias)

### 1. Em que cenários este sistema pode produzir resultados inconsistentes?
Principalmente em condições de **Race Condition** nas Regras. Se uma regra depende de um estado externo que muda durante o processamento (ex: "se saldo > 100"), e dois eventos são processados em paralelo, ambos podem ser aprovados incorretamente.
Além disso, como não há *Distributed Locking* nas ações, se o worker morrer logo após enviar um email mas antes de confirmar o job no Redis, o evento será reprocessado e o email enviado duas vezes.

### 2. Que garantias de idempotência existem — e onde elas falham?
Existe uma verificação "soft" de `externalId` na ingestão, logando duplicatas.
* **Onde falha:** Se duas requisições com o mesmo ID chegarem exatamente no mesmo milissegundo, a leitura no banco pode ocorrer antes da escrita da primeira, gerando duplicidade no banco.
* **Solução Ideal:** Unique Constraint no banco (hard fail) ou Lock no Redis durante o processamento.

### 3. O que acontece se dois eventos iguais forem processados ao mesmo tempo?
O sistema utiliza controle de concorrência otimista implícito (Last Write Wins) no banco de dados. Os logs de ambos serão gravados, mas o status final será do último worker que terminar. As ações colaterais (webhooks, emails) **serão executadas duas vezes**, pois não há verificação de duplicidade na camada de Action.

### 4. O que você mudaria para lidar com concorrência real?
1.  **Optimistic Concurrency Control (OCC):** Adicionar uma coluna `version` no evento. O worker só atualiza se a versão no banco for a mesma que ele leu.
2.  **Partitioning:** Usar chaves de particionamento no Redis/Kafka baseadas no `externalId` para garantir que eventos do mesmo ID sejam processados sequencialmente pelo mesmo consumidor.

### 5. Qual parte do sistema você menos confia hoje?
No **Motor de Regras Dinâmicas**. Atualmente ele carrega as regras do banco a cada evento. Em alta carga, isso seria ruim.
* **Melhoria:** Implementar cache (Redis) para as regras com invalidamento inteligente (TTL ou Pub/Sub quando uma regra for alterada).

---

## 🧪 Testes Manuais

Para testar a resiliência:
1.  Envie um evento com `type: "CHAOS_TEST"` e `payload: { "force_error": true }`.
2.  Observe o status **FAILED** no Console.
3.  Inspecione a timeline de logs.
4.  Acione o **Replay** e veja o sistema tentar novamente.
