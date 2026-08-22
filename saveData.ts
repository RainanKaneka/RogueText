const SAVE_KEY = 'roguetext_save';

export interface SaveData {
  andarMaxAlcancado: number;
  gold: number;
  armasExtras: string[];
  consumiveisExtras: string[];
  flags?: string[];
}

const DEFAULT_SAVE: SaveData = {
  andarMaxAlcancado: 0,
  gold: 0,
  armasExtras: [],
  consumiveisExtras: [],
  flags: [],
};

export function lerSave(): SaveData {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      return { ...DEFAULT_SAVE, ...JSON.parse(raw) };
    }
  } catch (e) {
    // Se estiver corrompido ou erro de parse, retorna default
    console.error('Erro ao ler save:', e);
  }
  return { ...DEFAULT_SAVE };
}

export function salvarSave(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Erro ao salvar progresso:', e);
  }
}

export function atualizarAndarMax(andarAtual: number): void {
  const save = lerSave();
  if (andarAtual > save.andarMaxAlcancado) {
    save.andarMaxAlcancado = andarAtual;
    salvarSave(save);
  }
}

export function adicionarGold(quantidade: number): void {
  const save = lerSave();
  save.gold += quantidade;
  salvarSave(save);
}

export function gastarGold(quantidade: number): boolean {
  const save = lerSave();
  if (save.gold >= quantidade) {
    save.gold -= quantidade;
    salvarSave(save);
    return true;
  }
  return false;
}

export function adicionarArmaExtra(nomeArma: string): void {
  const save = lerSave();
  save.armasExtras.push(nomeArma);
  salvarSave(save);
}

export function limparArmasExtras(): void {
  const save = lerSave();
  save.armasExtras = [];
  salvarSave(save);
}

export function adicionarConsumivelExtra(nomeItem: string): void {
  const save = lerSave();
  save.consumiveisExtras.push(nomeItem);
  salvarSave(save);
}

export function limparConsumiveisExtras(): void {
  const save = lerSave();
  save.consumiveisExtras = [];
  salvarSave(save);
}

export function desbloquearFlag(flagName: string): void {
  const save = lerSave();
  if (!save.flags) save.flags = [];
  if (!save.flags.includes(flagName)) {
    save.flags.push(flagName);
    salvarSave(save);
  }
}

export function temFlag(flagName: string): boolean {
  const save = lerSave();
  return !!save.flags?.includes(flagName);
}

