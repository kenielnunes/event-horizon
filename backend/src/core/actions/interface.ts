/**
 * Interface Genérica para Estratégias de Ação.
 * * @template TPayload O tipo do dado que vem do evento (ex: Order, User).
 * @template TParams O tipo da configuração da ação (ex: { to: string, url: string }).
 */
export interface IActionStrategy<TPayload = any, TParams = Record<string, any>> {
  execute(payload: TPayload, params: TParams): Promise<void>;
}