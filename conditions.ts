export type TipoCondicao = "Amedrontado" | "Envenenado" | "Queimando" | "Paralisado" | "Lentidão" | "Caído";

export interface Condicao {
  nome: TipoCondicao;
  duracao: number; // Turnos restantes
  danoOpcional?: number; // Usado para Queimando/Envenenado
  stacks?: number; // Usado para escalar o Envenenamento
}
