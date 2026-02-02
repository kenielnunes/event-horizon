export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Event Horizon API",
    version: "1.0.0",
    description: "API para ingestão e processamento de eventos assíncronos. \n\n**Dica:** Use o dropdown 'Examples' no endpoint POST /events para testar cenários de Erro e Email."
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Servidor Local"
    }
  ],
  paths: {
    "/events": {
      post: {
        summary: "Ingestão de Eventos",
        description: "Recebe um evento. O endpoint aceita qualquer payload, mas use os exemplos pré-configurados para testar funcionalidades específicas.",
        tags: ["Events"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/EventInput"
              },
              // AQUI ESTÃO OS CENÁRIOS DE TESTE
              examples: {
                CenarioSucesso: {
                  summary: "1. Cenário Padrão (Sucesso)",
                  value: {
                    externalId: "ord-12345",
                    type: "ORDER_CREATED",
                    payload: {
                      total: 1500,
                      items: ["Notebook Gamer"],
                      customer: {
                        email: "cliente@teste.com"
                      }
                    }
                  }
                },
                CenarioChaos: {
                  summary: "2. Cenário de Falha (Chaos Test)",
                  description: "Este evento dispara a regra 'CHAOS_TEST' que força um erro no Worker para testar o sistema de logs e replay.",
                  value: {
                    externalId: "chaos-test-01",
                    type: "CHAOS_TEST",
                    payload: {
                      force_error: true,
                      reason: "Simulação de falha crítica para validação de resiliência"
                    }
                  }
                },
                CenarioEmail: {
                  summary: "3. Cenário de Email (Nodemailer)",
                  description: "Este evento dispara a regra 'USER_SIGNUP' que envia um email via Ethereal (Fake SMTP). Verifique o console do worker para o link de preview.",
                  value: {
                    externalId: "signup-test-01",
                    type: "USER_SIGNUP",
                    payload: {
                      user: {
                        name: "Recrutador",
                        email: "admin@empresa.com"
                      },
                      origin: "landing_page_v2"
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          "202": {
            description: "Evento aceito e enfileirado com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/EventResponse"
                }
              }
            }
          }
        }
      },
      get: {
        summary: "Listar Eventos",
        tags: ["Events"],
        responses: {
          "200": {
            description: "Lista dos últimos eventos processados"
          }
        }
      }
    },
    "/events/{id}/replay": {
      post: {
        summary: "Reprocessar Evento (Replay)",
        tags: ["Operations"],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: {
              type: "string"
            },
            description: "ID interno do evento (UUID)"
          }
        ],
        responses: {
          "200": {
            description: "Evento reenfileirado para processamento"
          },
          "404": {
            description: "Evento não encontrado"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      EventInput: {
        type: "object",
        required: ["externalId", "type", "payload"],
        properties: {
          externalId: {
            type: "string",
            description: "ID de idempotência vindo do sistema externo"
          },
          type: {
            type: "string",
            description: "Tipo do evento usado para roteamento de regras"
          },
          payload: {
            type: "object",
            description: "Dados arbitrários do evento"
          }
        }
      },
      EventResponse: {
        type: "object",
        properties: {
          id: {
            type: "string",
            format: "uuid"
          },
          status: {
            type: "string",
            example: "RECEIVED"
          },
          timestamp: {
            type: "string",
            format: "date-time"
          }
        }
      }
    }
  }
};