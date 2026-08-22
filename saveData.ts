const SAVE_KEY = 'roguetext_save';

export interface SaveData {
  andarMaxAlcancado: number;
  gold: number;
  armasExtras: string[];
  armadurasExtras: string[];
  acessoriosExtras: string[];
  consumiveisExtras: string[];
  flags?: string[];
  drops?: Record<string, number>;
  armaduraEquipada?: string;
  acessorioEquipado?: string;
  armaEquipada?: string;
}

const DEFAULT_SAVE: SaveData = {
  andarMaxAlcancado: 0,
  gold: 0,
  armasExtras: [],
  armadurasExtras: [],
  acessoriosExtras: [],
  consumiveisExtras: [],
  flags: [],
  drops: {},
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

export function adicionarArmaduraExtra(nome: string): void {
  const save = lerSave();
  save.armadurasExtras.push(nome);
  salvarSave(save);
}

export function adicionarAcessorioExtra(nome: string): void {
  const save = lerSave();
  save.acessoriosExtras.push(nome);
  salvarSave(save);
}

export function removerItemExtra(nomeItem: string): void {
  const save = lerSave();
  let removido = false;
  const iArma = save.armasExtras.indexOf(nomeItem);
  if (iArma !== -1) { save.armasExtras.splice(iArma, 1); removido = true; }
  
  const iArmadura = save.armadurasExtras.indexOf(nomeItem);
  if (!removido && iArmadura !== -1) { save.armadurasExtras.splice(iArmadura, 1); removido = true; }
  
  const iAcc = save.acessoriosExtras.indexOf(nomeItem);
  if (!removido && iAcc !== -1) { save.acessoriosExtras.splice(iAcc, 1); removido = true; }
  
  if (removido) salvarSave(save);
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

export function adicionarDrop(nome: string, quantidade: number = 1): void {
  const save = lerSave();
  if (!save.drops) save.drops = {};
  save.drops[nome] = (save.drops[nome] ?? 0) + quantidade;
  salvarSave(save);
}

export function lerDrops(): Record<string, number> {
  const save = lerSave();
  return save.drops ?? {};
}

export function consumirDrops(receita: Record<string, number>): boolean {
  const save = lerSave();
  if (!save.drops) save.drops = {};
  const dropsSeguros = save.drops;
  
  // Verifica se tem todos os materiais
  for (const [material, qtdReq] of Object.entries(receita)) {
    const qtdPossui = dropsSeguros[material] ?? 0;
    if (qtdPossui < qtdReq) return false;
  }
  
  // Consome
  for (const [material, qtdReq] of Object.entries(receita)) {
    dropsSeguros[material] -= qtdReq;
    if (dropsSeguros[material] <= 0) delete dropsSeguros[material];
  }
  
  salvarSave(save);
  return true;
}

export interface LoadoutSalvo {
  arma: string;
  armadura: string;
  acessorio: string;
}

export function salvarLoadout(loadout: LoadoutSalvo): void {
  const save = lerSave();
  save.armaEquipada = loadout.arma;
  save.armaduraEquipada = loadout.armadura;
  save.acessorioEquipado = loadout.acessorio;
  salvarSave(save);
}

export function lerLoadout(): LoadoutSalvo {
  const save = lerSave();
  return {
    arma: save.armaEquipada ?? "Espada Quebrada",
    armadura: save.armaduraEquipada ?? "Robes Rasgados",
    acessorio: save.acessorioEquipado ?? "Sem Acessório",
  };
}

