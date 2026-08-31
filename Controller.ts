import { mainCharacter } from "./mainCharacter";
import { enemy, battleEnemies } from "./enemies";
import { listaConsumiveis, listaArmas, listaArmaduras, listaAcessorios, abrirBau, bauDoAndar, listaBaus } from "./artefacts";
import { sortearTresHabilidades } from "./actions";
import { getClassesDisponiveis, getClassesBloqueadas, aplicarClasse } from "./classes";
import { lerSave, salvarSave, atualizarAndarMax, adicionarGold, gastarGold, adicionarArmaExtra, limparArmasExtras, adicionarConsumivelExtra, limparConsumiveisExtras, desbloquearFlag, adicionarDrop, lerDrops, salvarLoadout, lerLoadout, removerItemExtra, consumirDrops, adicionarArmaduraExtra, adicionarAcessorioExtra, temFlag, registrarChegadaAndar, registrarExpedicaoConcluida, registrarMonstroVisto, registrarItemVisto } from "./saveData";
import { rolarDrops, tabelaDrops } from "./drops.js";
import { initMusic, playMusic, playSfx, updateHeartbeat, setMusicVolume, setSfxVolume, musicVolume, sfxVolume } from "./music.js";
import { showParryBar, setParryWindowBonus, parryStreak } from "./parry.js";
import { type Expedition, type ExpeditionId, type RoomDescription, expeditions, getExpedicoesDesbloqueadas, getExpedicoesBloqueadas, getExpedition, sortearDescricaoSala } from "./expeditions.js";
import chalk from "chalk";

// Dados Globais
function getWeaponTooltip(arma: any): string {
  if (!arma || !arma.scaling) return "";
  const s = arma.scaling;
  let t = `<strong style="color:var(--accent-color)">Scaling</strong><br>FOR: ${s.strength} | DES: ${s.dexterity} | INT: ${s.intelligence}`;
  if (s.luck) t += ` | SOR: ${s.luck}`;
  return `<div class="btn-tooltip">${t}</div>`;
}

export let runStats = {
  danoCausado: 0,
  danoRecebido: 0,
  vidaCurada: 0,
  esquivas: 0,
  acertosCriticos: 0,
  parryAcertos: 0,
  parryErros: 0,
  mortoPor: "",
  andarDaMorte: 0,
  salaDaMorte: 0,
  resultado: "" // "VITÓRIA", "MORTE" ou "FUGA"
};

let triggerScreenShake = false;

export function resetRunStats() {
  runStats = {
    danoCausado: 0,
    danoRecebido: 0,
    vidaCurada: 0,
    esquivas: 0,
    acertosCriticos: 0,
    parryAcertos: 0,
    parryErros: 0,
    mortoPor: "",
    andarDaMorte: 0,
    salaDaMorte: 0,
    resultado: ""
  };
}

// Expedição ativa (definida ao selecionar uma expedição)
let expedicaoAtiva: Expedition = expeditions.ancient_dungeon;
let descricoesUsadasNaRun: Set<string> = new Set();

// Lookup de monstros/bosses agora usa a expedição ativa
function getMonstrosPorAndar(): { [key: number]: string[] } {
  return expedicaoAtiva.monstrosPorAndar;
}
function getBossesPorAndar(): { [key: number]: string[] } {
  return expedicaoAtiva.bossesPorAndar;
}

// Estado da Aplicação
type GameState = "LOBBY" | "LOJA" | "FERREIRO" | "CLASSES" | "SELECAO_CLASSE" | "SELECAO_LOADOUT" | "EXPLORACAO" | "BATALHA" | "LEVEL_UP_SKILL" | "ALOCAR_ATRIBUTO" | "GAME_OVER" | "SOBRE" | "MOCHILA" | "MARCOS" | "FAST_TRAVEL" | "ESTATISTICAS_RUN" | "CONFIRMAR_VENDA" | "EVENTO_BOSS" | "EVENTO_RECOMPENSA" | "ESCOLHA_SALA" | "EVENTO_FOGUEIRA" | "EVENTO_ALTAR" | "EVENTO_PORTAL" | "EXPEDICOES" | "RESUMO_BATALHA" | "LEVEL_UP_SCREEN";

let estadoAtual: GameState = "LOBBY";
let jogador: mainCharacter;
let inimigosAtuais: enemy[] = [];
let inimigosFugindo: enemy[] = [];
let aliadosAtuais: enemy[] = [];
let andarAtual: number = 1;
let multiplicadorDificuldade: number = 1; // 1 = Normal, >1 = Expedições
let salaAtual: number = 0;
let logMensagem: string = "Bem-vindo ao RogueText!";
let opcoesAcao: { texto: string, acao: () => void, descricao?: string }[] = [];
let lojaAba: "comprar" | "vender" = "comprar";
let itemParaConfirmarVenda: { tipo: "arma" | "consumivel"; nome: string; raridade: string; preco: number } | null = null;
let raioNegroStack: number = 0; // Stack dinâmico de crit da passiva Raio Negro
let furiaPenalidade: boolean = false;    // Próximo combate terá penalidade
let furiaPenalidadeAtiva: boolean = false; // Penalidade ativa no combate atual
let furiaSkipouPrimeiroTurno: boolean = false; // Já pulou o 1º turno deste combate
let primeiroTurnoDoCombate: boolean = true;
let primeiraSalaCombate: boolean = true;
let assassinoCritou: boolean = false;

// Preços de revenda por raridade (em ouro)
const PRECO_REVENDA: Record<string, number> = {
  "COMUM": 80,
  "RARA": 200,
  "EPICA": 500,
  "LENDARIA": 1200,
  "UNICA": 3000,
};

// Funções de UI
const app = document.getElementById("game-container")!;

let battleEventTimeout: any = null;
let skillsPendenteDeEscolha: number = 0;
let ultimoEventoSala: string = "";

function iniciarExploracaoBase() {
  registrarChegadaAndar(1);
  estadoAtual = "EXPLORACAO";
  opcoesAcao = [{ texto: "Iniciar Jornada", acao: () => avancarSala() }];
  atualizarLog(expedicaoAtiva.introducao);
  render();
}

function simularRunAte(andarDestino: number): { xp: number, gold: number } {
  let xpTotal = 0;
  let goldTotal = 0;

  for (let a = 1; a < andarDestino; a++) {
    const factorATK = Math.pow(1.38, a - 1);
    const factorHP = Math.pow(1.45, a - 1);

    const normais = getMonstrosPorAndar()[a] || [];
    if (normais.length > 0) {
      let sumXP = 0;
      normais.forEach(nome => {
        const base = battleEnemies[nome as keyof typeof battleEnemies] || { attackPower: 10, life: 30 };
        const scaledATK = Math.floor(base.attackPower * factorATK * multiplicadorDificuldade);
        const scaledHP = Math.floor(base.life * factorHP * multiplicadorDificuldade);
        sumXP += Math.floor((scaledATK * 2.5) + (scaledHP * 1.5));
      });
      const avgXP = sumXP / normais.length;
      xpTotal += avgXP * 18; // 9 salas x 2 monstros médios
    }

    const bosses = getBossesPorAndar()[a] || [];
    if (bosses.length > 0) {
      let sumBossXP = 0;
      bosses.forEach(nome => {
        const base = battleEnemies[nome as keyof typeof battleEnemies] || { attackPower: 20, life: 60 };
        const scaledATK = Math.floor(base.attackPower * 1.3 * factorATK * multiplicadorDificuldade);
        const scaledHP = Math.floor(base.life * 2.0 * factorHP * multiplicadorDificuldade);
        sumBossXP += Math.floor((scaledATK * 2.5) + (scaledHP * 1.5));
      });
      const avgBossXP = sumBossXP / bosses.length;
      xpTotal += avgBossXP;
    }

    for (let sala = 1; sala <= 10; sala++) {
      xpTotal += Math.floor(((a * a * 20) + (sala * a * 5)) * multiplicadorDificuldade);
      goldTotal += Math.floor(((a * 5) + sala) * multiplicadorDificuldade);
    }
  }
  return { xp: xpTotal, gold: goldTotal };
}

let battleSummary = {
  inimigosDerrotados: [] as string[],
  drops: [] as string[],
  xpGanho: 0,
  ouroGanho: 0,
  armasEncontradas: [] as import('./artefacts').IWeapons[],
  consumiveisEncontrados: [] as import('./artefacts').IConsumable[]
};

function resetBattleSummary() {
  battleSummary = {
    inimigosDerrotados: [],
    drops: [],
    xpGanho: 0,
    ouroGanho: 0,
    armasEncontradas: [],
    consumiveisEncontrados: []
  };
}

let typeWriterTimeout: any = null;
let isTyping = false;

function atualizarLog(msg: string, onComplete?: () => void) {
  if (typeWriterTimeout) clearTimeout(typeWriterTimeout);
  logMensagem = msg;
  render(); // Initial render to update HUD

  const logEl = document.querySelector('.action-log');
  if (logEl) {
    logEl.innerHTML = "";
    isTyping = true;
    let i = 0;
    function type() {
      if (i < msg.length) {
        if (msg.charAt(i) === '<') {
          const endTag = msg.indexOf('>', i);
          if (endTag !== -1) {
            i = endTag + 1;
          } else {
            i++;
          }
        } else {
          i++;
        }
        logEl!.innerHTML = msg.substring(0, i);
        typeWriterTimeout = setTimeout(type, 20); // 20ms per character
      } else {
        isTyping = false;
        if (onComplete) onComplete();
      }
    }
    type();
  } else {
    if (onComplete) onComplete();
  }
}

function getConditionIcons(condicoes: { nome: string, duracao: number, stacks?: number }[]): string {
  if (!condicoes || condicoes.length === 0) return "";
  const icones: Record<string, string> = {
    "Amedrontado": "😨",
    "Envenenado": "🤢",
    "Queimando": "🔥",
    "Paralisado": "⚡",
    "Caído": "💫",
    "Lentidão": "🐌",
    "Quebra de Armadura": "🛡️",
    "Cegueira": "👁️‍🗨️"
  };
  return condicoes.map(c => `<span title="${c.nome} (${c.duracao} turnos${c.stacks ? `, ${c.stacks} stacks` : ''})">${icones[c.nome] || "❓"}</span>`).join(" ");
}

function getConditionBarColor(condicoes: { nome: string }[], defaultColor: string): string {
  if (!condicoes || condicoes.length === 0) return defaultColor;

  const prioridadesCor: Record<string, string> = {
    "Envenenado": "#2b8a3e", // Verde veneno
    "Queimando": "#e8590c",  // Laranja fogo
    "Paralisado": "#fcc419", // Amarelo raio
    "Caído": "#868e96",      // Cinza chao
    "Lentidão": "#339af0",   // Azul gelo
    "Quebra de Armadura": "#495057", // Cinza escuro
    "Cegueira": "#212529",   // Preto/Cinza muito escuro
    "Amedrontado": "#845ef7" // Roxo medo
  };

  for (let c of condicoes) {
    if (prioridadesCor[c.nome]) return prioridadesCor[c.nome];
  }
  return defaultColor;
}

function render() {
  const app = document.getElementById("app")!;
  if (triggerScreenShake) {
    app.classList.remove("shake-screen");
    void app.offsetWidth; // Force reflow
    app.classList.add("shake-screen");
    triggerScreenShake = false;
  }

  app.innerHTML = "";

  if (typeof jogador !== "undefined" && jogador) {
    updateHeartbeat(jogador.life / jogador.maxLife);
  } else {
    updateHeartbeat(1); // turn off if not initialized
  }

  if (estadoAtual === "LOBBY") {
    app.innerHTML = `
      <h1 id="game-title">RogueText</h1>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <button class="btn-lobby" id="btn-nova-run">Expedições</button>
        <button class="btn-lobby" id="btn-loja">Loja</button>
        <button class="btn-lobby" id="btn-ferreiro">Ferreiro</button>
        <button class="btn-lobby" id="btn-mochila">Mochila</button>
        <button class="btn-lobby" id="btn-marcos">Marcos</button>
        <button class="btn-lobby" id="btn-classes">Classes</button>
        <button class="btn-lobby" id="btn-diario">Diário do Explorador</button>
        <button class="btn-lobby" id="btn-sobre">Sobre o Jogo</button>
      </div>`;
    document.getElementById("btn-nova-run")!.onclick = () => { estadoAtual = "EXPEDICOES"; render(); };
    document.getElementById("btn-classes")!.onclick = () => { estadoAtual = "CLASSES"; render(); };
    document.getElementById("btn-loja")!.onclick = () => { estadoAtual = "LOJA"; render(); };
    document.getElementById("btn-ferreiro")!.onclick = () => { estadoAtual = "FERREIRO"; render(); };
    document.getElementById("btn-sobre")!.onclick = () => { estadoAtual = "SOBRE"; render(); };
    document.getElementById("btn-mochila")!.onclick = () => { estadoAtual = "MOCHILA"; render(); };
    document.getElementById("btn-marcos")!.onclick = () => { estadoAtual = "MARCOS"; render(); };
    document.getElementById("btn-diario")!.onclick = () => { estadoAtual = "DIARIO"; render(); };

    document.querySelectorAll(".btn-lobby").forEach(btn => {
      btn.addEventListener("mouseenter", () => playSfx("hover"));
    });

    playMusic("title");
    return;
  }

  if (estadoAtual === "ESTATISTICAS_RUN") {
    let titulo = runStats.resultado === "VITÓRIA" ? "EXPEDIÇÃO CONCLUÍDA" :
      runStats.resultado === "FUGA" ? "FUGA BEM SUCEDIDA" : "VOCÊ MORREU";

    let color = runStats.resultado === "VITÓRIA" ? "#ffd700" :
      runStats.resultado === "FUGA" ? "#ffffffff" : "#fa5252";

    let causaMorteHTML = "";
    if (runStats.resultado === "MORTE") {
      causaMorteHTML = `<p style="color: #ff8787; text-align: center;">Morto por <strong>${runStats.mortoPor}</strong> no Andar ${runStats.andarDaMorte}, Sala ${runStats.salaDaMorte}</p>`;
    }

    app.innerHTML = `
      <div style="max-width: 600px; margin: 0 auto; background: rgba(0,0,0,0.8); border: 2px solid ${color}; padding: 20px; border-radius: 8px;">
        <h1 style="color: ${color}; text-align: center; margin-top: 0;">${titulo}</h1>
        ${causaMorteHTML}
        
        <h3 style="border-bottom: 1px solid #444; padding-bottom: 5px;">Estatísticas de Combate</h3>
        <ul style="list-style: none; padding: 0; margin: 10px 0; font-size: 1.1rem; line-height: 1.6;">
          <li> <strong>Dano Causado:</strong> <span style="color:#ffd43b">${runStats.danoCausado}</span></li>
          <li> <strong>Dano Recebido:</strong> <span style="color:#fa5252">${runStats.danoRecebido}</span></li>
          <li> <strong>Vida Curada:</strong> <span style="color:#69db7c">${runStats.vidaCurada}</span></li>
          <li> <strong>Esquivas:</strong> <span style="color:#4dabf7">${runStats.esquivas}</span></li>
          <li> <strong>Acertos Críticos:</strong> <span style="color:#ff922b">${runStats.acertosCriticos}</span></li>
          <li> <strong>Parry (Acertos / Erros):</strong> <span style="color:#a9e34b">${runStats.parryAcertos}</span> / <span style="color:#ff8787">${runStats.parryErros}</span></li>
        </ul>
        
        <div style="text-align: center; margin-top: 20px;">
          <button class="btn-lobby" id="btn-voltar-lobby" style="width: 100%;">Voltar ao Lobby</button>
        </div>
      </div>
    `;

    document.getElementById("btn-voltar-lobby")!.onclick = () => {
      estadoAtual = "LOBBY";
      render();
    };

    return;
  }

  if (estadoAtual === "EXPEDICOES") {
    const save = lerSave();
    const concluidas = save.expedicoesConcluidas || [];
    const desbloqueadas = getExpedicoesDesbloqueadas(concluidas);
    const bloqueadas = getExpedicoesBloqueadas(concluidas);

    let html = `<h2>🗺️ Expedições</h2>
      <div style="display:flex; flex-direction:column; gap:14px; margin-bottom: 20px;">`;

    // Cards de expedições desbloqueadas
    desbloqueadas.forEach(exp => {
      const jaConcluiu = concluidas.includes(exp.id);
      const badgeConcluida = jaConcluiu ? `<span style="color:#69db7c; font-size:0.8rem; margin-left:8px;">✅ Concluída</span>` : '';
      const dificuldadeStars = '⭐'.repeat(Math.min(exp.dificuldadeBase, 5));

      html += `
        <div class="expedition-card" id="btn-exp-${exp.id}" style="
          border: 2px solid ${exp.corTema};
          border-radius: 8px;
          padding: 14px;
          cursor: pointer;
          background: linear-gradient(135deg, rgba(0,0,0,0.85), rgba(0,0,0,0.6));
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        ">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span style="font-size:1.6rem;">${exp.icone}</span>
            <h3 style="margin:0; color:${exp.corTema}; font-size:1.1rem;">${exp.nome}</h3>
            ${badgeConcluida}
          </div>
          <p style="margin:4px 0 8px; color:#bbb; font-size:0.85rem; line-height:1.4;">${exp.descricao}</p>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; color:#888;">
            <span>Dificuldade: ${dificuldadeStars}</span>
            <span>${exp.andares} andares</span>
          </div>
          <div style="position:absolute; top:0; left:0; width:100%; height:3px; background:${exp.corTema};"></div>
        </div>`;
    });

    // Cards de expedições bloqueadas
    bloqueadas.forEach(exp => {
      html += `
        <div style="
          border: 2px solid #333;
          border-radius: 8px;
          padding: 14px;
          opacity: 0.45;
          cursor: not-allowed;
          background: rgba(0,0,0,0.7);
        ">
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span style="font-size:1.6rem;">🔒</span>
            <h3 style="margin:0; color:#555; font-size:1.1rem;">???</h3>
          </div>
          <p style="margin:4px 0; color:#555; font-size:0.85rem;">Complete a Masmorra Antiga para desbloquear.</p>
        </div>`;
    });

    html += `</div>
      <button class="btn-lobby" style="background:#555;" id="btn-expedicoes-voltar">Voltar</button>
    `;
    app.innerHTML = html;

    // Bind click events para cada expedição desbloqueada
    desbloqueadas.forEach(exp => {
      const btn = document.getElementById(`btn-exp-${exp.id}`);
      if (btn) {
        btn.onmouseenter = () => {
          btn.style.transform = "scale(1.02)";
          btn.style.boxShadow = `0 0 15px ${exp.corTema}44`;
          playSfx("hover");
        };
        btn.onmouseleave = () => {
          btn.style.transform = "scale(1)";
          btn.style.boxShadow = "none";
        };
        btn.onclick = () => {
          expedicaoAtiva = exp;
          multiplicadorDificuldade = exp.dificuldadeBase;
          iniciarNovaRun();
        };
      }
    });

    document.getElementById("btn-expedicoes-voltar")!.onclick = () => {
      estadoAtual = "LOBBY";
      render();
    };
    return;
  }

  if (estadoAtual === "DIARIO") {
    // Definimos uma tabAtual para o Diário, se não existir cria uma global.
    // Usaremos window para manter simples.
    const tabAtual = (window as any).diarioTabAtual || "CRIATURAS";
    const save = lerSave();

    let html = `<h2 style="text-align: center; color: #ffd43b;">Diário do Explorador</h2>`;
    html += `
      <div style="display: flex; gap: 10px; margin-bottom: 20px; justify-content: center;">
        <button class="btn-action ${tabAtual === 'CRIATURAS' ? 'active-tab' : ''}" id="btn-tab-criaturas">Criaturas</button>
        <button class="btn-action ${tabAtual === 'ITENS' ? 'active-tab' : ''}" id="btn-tab-itens">Itens</button>
        <button class="btn-action ${tabAtual === 'EXPEDICOES' ? 'active-tab' : ''}" id="btn-tab-expedicoes">Expedições</button>
      </div>
    `;

    html += `<div class="diary-book">`;

    if (tabAtual === "CRIATURAS") {
      const monstros = save.monstrosVistos || [];
      const itemSelecionado = (window as any).diarioItemSelecionado;

      // PÁGINA ESQUERDA - LISTA
      html += `<div class="diary-page-left">`;
      html += `<h3 style="text-align: center; border-bottom: 1px solid #444; padding-bottom: 5px;">Criaturas Conhecidas</h3>`;
      html += `<div class="diary-list">`;
      if (monstros.length === 0) {
        html += `<p style="color: #666; font-style: italic; text-align: center;">Nenhuma criatura registrada ainda.</p>`;
      } else {
        monstros.forEach((m, i) => {
          const isSelected = itemSelecionado === m;
          html += `<button class="diary-list-btn ${isSelected ? 'selected' : ''}" id="btn-diary-item-${i}">${m}</button>`;
        });
      }
      html += `</div></div>`;

      // PÁGINA DIREITA - DETALHES
      html += `<div class="diary-page-right">`;
      if (itemSelecionado && monstros.includes(itemSelecionado)) {
        const obj = battleEnemies[itemSelecionado as keyof typeof battleEnemies];
        if (obj) {
          html += `
            <h3 style="color: #8b0000; margin-top: 0;">${itemSelecionado}</h3>
            <p style="font-style: italic; color: #555; line-height: 1.4;">${obj.descricao || "Uma criatura misteriosa das profundezas."}</p>
            <div style="margin-top: 15px;">
              <strong style="color: #2b8a3e;">Estatísticas Base:</strong><br>
              🗡️ Ataque: ${obj.attackPower}<br>
              ❤️ Vida: ${obj.life}
            </div>
            <div style="margin-top: 15px;">
              <strong style="color: #e67700;">Possíveis Drops:</strong><br>
            `;
          // Tenta pegar a lista de drops direto do rolarDrops ou tabelaDrops
          // Como drops são dinâmicos ou tabela, podemos simular para mostrar o que dropa
          // tabelaDrops será importado no topo
          let dropsDoMonstro = tabelaDrops[itemSelecionado as keyof typeof tabelaDrops];
          if (!dropsDoMonstro) {
            const isGelo = /(Gelo|Ártico|Frio|Yeti|Congelado|Permafrost|Cristalino)/i.test(itemSelecionado);
            const isFogo = /(Fogo|Lava|Flamejante|Infernal|Magma|Cinzas|Vulcão|Vulcânico|Salamandra|Fênix|Efreet)/i.test(itemSelecionado);
            const isTrevas = /(Sombra|Trevas|Sombrio|Espectro|Pesadelo|Vampiro|Assassino|Banshee|Lich|Demônio|Alma|Ceifador|Wraith)/i.test(itemSelecionado);
            let drop1 = `Fragmento de ${itemSelecionado}`;
            let drop2 = `Essência de ${itemSelecionado}`;
            if (isGelo) { drop1 = `Fragmento Congelado de ${itemSelecionado}`; drop2 = `Essência Gelada de ${itemSelecionado}`; }
            else if (isFogo) { drop1 = `Fragmento Ígneo de ${itemSelecionado}`; drop2 = `Cinzas de ${itemSelecionado}`; }
            else if (isTrevas) { drop1 = `Fragmento Sombrio de ${itemSelecionado}`; drop2 = `Essência Corrupta de ${itemSelecionado}`; }
            dropsDoMonstro = [drop1, drop2];
          }
          html += `<ul style="padding-left: 20px; color: #444; margin-top: 5px;">`;
          dropsDoMonstro.forEach((d: string) => {
            html += `<li>${d}</li>`;
          });
          html += `</ul></div>`;
        } else {
          html += `<p>Dados corrompidos.</p>`;
        }
      } else {
        html += `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#555;">Selecione uma criatura na página esquerda.</div>`;
      }
      html += `</div>`;
    } else if (tabAtual === "ITENS") {
      // Auto-register current items to ensure they show up even if missed
      const s = save;
      if (s.armasExtras) s.armasExtras.forEach(i => registrarItemVisto(i));
      if (s.armadurasExtras) s.armadurasExtras.forEach(i => registrarItemVisto(i));
      if (s.acessoriosExtras) s.acessoriosExtras.forEach(i => registrarItemVisto(i));
      if (s.consumiveisExtras) s.consumiveisExtras.forEach(i => registrarItemVisto(i));
      if (s.armaEquipada) registrarItemVisto(s.armaEquipada);
      if (s.armaduraEquipada) registrarItemVisto(s.armaduraEquipada);
      if (s.acessoriosEquipados) s.acessoriosEquipados.forEach(i => registrarItemVisto(i));
      if (s.drops) Object.keys(s.drops).forEach(i => registrarItemVisto(i));
      if (jogador) {
        jogador.weaponInventory.forEach(w => registrarItemVisto(w.name));
        jogador.inventory.forEach(i => registrarItemVisto(i));
        if (jogador.equippedWeapon) registrarItemVisto(jogador.equippedWeapon.name);
        if (jogador.equippedArmor) registrarItemVisto(jogador.equippedArmor.name);
        jogador.equippedAccessories.forEach(a => registrarItemVisto(a.name));
      }

      const itens = lerSave().itensVistos || [];
      const itemSelecionado = (window as any).diarioItemSelecionado;

      // PÁGINA ESQUERDA - LISTA
      html += `<div class="diary-page-left" style="overflow-y: auto;">`;
      html += `<h3 style="text-align: center; border-bottom: 1px solid #444; padding-bottom: 5px;">Itens Conhecidos</h3>`;
      html += `<div class="diary-list">`;
      if (itens.length === 0) {
        html += `<p style="color: #666; font-style: italic; text-align: center;">Nenhum item registrado ainda.</p>`;
      } else {
        // Group items for display? We can just list them alphabetically
        const itensOrdenados = [...itens].sort();
        itensOrdenados.forEach((it, i) => {
          const isSelected = itemSelecionado === it;
          html += `<button class="diary-list-btn ${isSelected ? 'selected' : ''}" id="btn-diary-item-id-${i}">${it}</button>`;
        });
      }
      html += `</div></div>`;

      // PÁGINA DIREITA - DETALHES
      html += `<div class="diary-page-right" style="overflow-y: auto;">`;
      if (itemSelecionado && itens.includes(itemSelecionado)) {
        let objStr = "";
        let nome = itemSelecionado;
        let desc = "";
        let utilidade = "";
        let stats = "";
        let passiva = "";

        if (listaArmas[itemSelecionado]) {
          const w = listaArmas[itemSelecionado]!;
          desc = w.description;
          utilidade = "Usado em combate para atacar inimigos fisicamente ou magicamente.";
          stats = `Dano: ${w.damage} | Escalonamento: FOR(${w.scaling.strength || '-'}) DES(${w.scaling.dexterity || '-'}) INT(${w.scaling.intelligence || '-'}) SOR(${w.scaling.luck || '-'})`;
        } else if (listaArmaduras[itemSelecionado]) {
          const a = listaArmaduras[itemSelecionado]!;
          desc = a.description;
          utilidade = "Fornece proteção contra danos e bônus de vida.";
          stats = `Vida: +${a.bonusVida} | Defesa: +${a.bonusDefesa}`;
          if (a.passiva) passiva = `[${a.passiva.nome}] ${a.passiva.descricao}`;
        } else if (listaAcessorios[itemSelecionado]) {
          const a = listaAcessorios[itemSelecionado]!;
          desc = a.description;
          utilidade = "Fornece bônus de atributos ou passivas especiais.";
          const s = a.bonusStats;
          if (s) {
            stats = `FOR: +${s.strength || 0} | DES: +${s.dexterity || 0} | INT: +${s.intelligence || 0} | SOR: +${s.luck || 0} | DEF: +${s.defense || 0}`;
          }
          if (a.passiva) passiva = `[${a.passiva.nome}] ${a.passiva.descricao}`;
        } else if (listaConsumiveis[itemSelecionado]) {
          const c = listaConsumiveis[itemSelecionado]!;
          desc = c.description;
          utilidade = "Item de uso único. Pode recuperar recursos ou aplicar efeitos no combate.";
        } else {
          // Fallback para drops/crafting materials
          desc = "Material misterioso derrubado por criaturas ou encontrado em baús.";
          utilidade = "Geralmente usado no Ferreiro para criar ou aprimorar equipamentos.";
        }

        html += `<h3 style="color: #0b7285; margin-top: 0;">${nome}</h3>`;
        html += `<p style="font-style: italic; color: #555; line-height: 1.4;">${desc}</p>`;
        html += `<div style="margin-top: 15px;">`;
        if (utilidade) html += `<p><strong>Utilidade:</strong> <span style="color: #444;">${utilidade}</span></p>`;
        if (stats) html += `<p><strong>Atributos:</strong> <span style="color: #2b8a3e;">${stats}</span></p>`;
        if (passiva) html += `<p><strong>Passiva:</strong> <span style="color: #e67700;">${passiva}</span></p>`;
        html += `</div>`;
      } else {
        html += `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#555; text-align:center;">Selecione um item na página esquerda.</div>`;
      }
      html += `</div>`;
    } else if (tabAtual === "EXPEDICOES") {
      const expConcluidas = save.expedicoesConcluidas || [];
      const contagemExp = expConcluidas.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const idsConcluidos = Object.keys(contagemExp);
      const itemSelecionado = (window as any).diarioItemSelecionado;

      // PÁGINA ESQUERDA - LISTA
      html += `<div class="diary-page-left" style="overflow-y: auto;">`;
      html += `<h3 style="text-align: center; border-bottom: 1px solid #444; padding-bottom: 5px;">Expedições Exploradas</h3>`;
      html += `<div class="diary-list">`;
      if (idsConcluidos.length === 0) {
        html += `<p style="color: #666; font-style: italic; text-align: center;">Nenhuma expedição concluída ainda.</p>`;
      } else {
        idsConcluidos.forEach((idExp, i) => {
          const exp = expeditions[idExp as keyof typeof expeditions];
          if (exp) {
            const isSelected = itemSelecionado === idExp;
            html += `<button class="diary-list-btn ${isSelected ? 'selected' : ''}" id="btn-diary-exp-${i}">${exp.nome}</button>`;
          }
        });
      }
      html += `</div></div>`;

      // PÁGINA DIREITA - DETALHES
      html += `<div class="diary-page-right" style="overflow-y: auto;">`;
      if (itemSelecionado && idsConcluidos.includes(itemSelecionado)) {
        const exp = expeditions[itemSelecionado as keyof typeof expeditions];
        if (exp) {
          const vitorias = contagemExp[itemSelecionado] || 0;

          // Coletar inimigos únicos
          const monstros = new Set<string>();
          Object.values(exp.monstrosPorAndar).forEach(arr => arr.forEach(m => monstros.add(m)));
          Object.values(exp.bossesPorAndar).forEach(arr => arr.forEach(m => monstros.add(m)));

          // Determinar mecânica (hardcoded baseada no id para dar um flavor, já que não tem na interface)
          let mecanica = "Nenhuma mecânica especial registrada.";
          if (exp.id === "ancient_dungeon") mecanica = "A mais clássica das masmorras. Uma introdução balanceada aos perigos do mundo.";
          if (exp.id === "frost_mountain") mecanica = "Ventos congelantes podem reduzir sua recuperação de vida. Monstros imunes ao frio.";
          if (exp.id === "flame_kingdom") mecanica = "O calor extremo derrete armaduras inferiores e buffa criaturas de fogo.";
          if (exp.id === "shadow_realm") mecanica = "A escuridão obscurece sua visão, aumentando as chances de encontros com elites surpresa.";

          html += `<h3 style="color: ${exp.corTema || '#8b0000'}; margin-top: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.3);">${exp.nome}</h3>`;
          html += `<p style="font-style: italic; color: #555; line-height: 1.4;">${exp.descricao}</p>`;
          html += `<div style="margin-top: 15px;">`;
          html += `<p><strong>🏆 Conclusões Bem-Sucedidas:</strong> <span style="color: #e67700; font-weight: bold;">${vitorias}</span></p>`;
          html += `<p><strong>📍 Andares:</strong> <span style="color: #444;">${exp.andares}</span></p>`;
          html += `<p><strong>⚙️ Mecânica Única:</strong> <span style="color: #2b8a3e;">${mecanica}</span></p>`;
          html += `</div>`;
          html += `<div style="margin-top: 15px;">`;
          html += `<strong style="color: #0b7285;">Fauna Encontrada:</strong><br>`;
          html += `<ul style="padding-left: 20px; color: #444; margin-top: 5px;">`;
          Array.from(monstros).forEach((m: string) => {
            html += `<li>${m}</li>`;
          });
          html += `</ul></div>`;
        }
      } else {
        html += `<div style="display:flex; height:100%; align-items:center; justify-content:center; color:#555; text-align:center;">Selecione uma expedição na página esquerda.</div>`;
      }
      html += `</div>`;
    }

    html += `</div>`; // diary-book fechamento

    html += `
      <div style="display: flex; justify-content: center; margin-top: 20px;">
        <button id="btn-diario-voltar" class="btn-action">Voltar à Vila</button>
      </div>
    `;

    app.innerHTML = html;

    setTimeout(() => {
      const btnVoltar = document.getElementById("btn-diario-voltar");
      if (btnVoltar) {
        btnVoltar.onclick = () => {
          (window as any).diarioItemSelecionado = null; // reset
          estadoAtual = "LOBBY";
          render();
        };
      }

      const tabCriaturas = document.getElementById("btn-tab-criaturas");
      if (tabCriaturas) tabCriaturas.onclick = () => { (window as any).diarioTabAtual = 'CRIATURAS'; (window as any).diaryScrollTop = 0; render(); };
      const tabItens = document.getElementById("btn-tab-itens");
      if (tabItens) tabItens.onclick = () => { (window as any).diarioTabAtual = 'ITENS'; (window as any).diaryScrollTop = 0; render(); };
      const tabExpedicoes = document.getElementById("btn-tab-expedicoes");
      if (tabExpedicoes) tabExpedicoes.onclick = () => { (window as any).diarioTabAtual = 'EXPEDICOES'; (window as any).diaryScrollTop = 0; render(); };

      if (tabAtual === "CRIATURAS") {
        const monstros = save.monstrosVistos || [];
        monstros.forEach((m, i) => {
          const btn = document.getElementById(`btn-diary-item-${i}`);
          if (btn) {
            btn.onclick = () => {
              const container = document.querySelector('.diary-page-left');
              if (container) (window as any).diaryScrollTop = container.scrollTop;
              (window as any).diarioItemSelecionado = m;
              render();
            };
          }
        });
      } else if (tabAtual === "ITENS") {
        const itens = save.itensVistos || [];
        const itensOrdenados = [...itens].sort();
        itensOrdenados.forEach((it, i) => {
          const btn = document.getElementById(`btn-diary-item-id-${i}`);
          if (btn) {
            btn.onclick = () => {
              const container = document.querySelector('.diary-page-left');
              if (container) (window as any).diaryScrollTop = container.scrollTop;
              (window as any).diarioItemSelecionado = it;
              render();
            };
          }
        });
      } else if (tabAtual === "EXPEDICOES") {
        const expConcluidas = save.expedicoesConcluidas || [];
        const idsConcluidos = Array.from(new Set(expConcluidas));
        idsConcluidos.forEach((idExp, i) => {
          const btn = document.getElementById(`btn-diary-exp-${i}`);
          if (btn) {
            btn.onclick = () => {
              const container = document.querySelector('.diary-page-left');
              if (container) (window as any).diaryScrollTop = container.scrollTop;
              (window as any).diarioItemSelecionado = idExp;
              render();
            };
          }
        });
      }

      // Restore scroll position for the left pane
      const container = document.querySelector('.diary-page-left');
      if (container && (window as any).diaryScrollTop !== undefined) {
        container.scrollTop = (window as any).diaryScrollTop;
      }
    }, 0);
    return;
  }

  if (estadoAtual === "CLASSES") {
    const save = lerSave();
    const classesDisp = getClassesDisponiveis(save);
    const classesBloq = getClassesBloqueadas(save);

    let html = `<h2>Classes Disponíveis</h2>`;
    html += `<div style="display:flex; flex-direction:column; gap:10px; margin-bottom: 20px;">`;
    classesDisp.forEach(c => {
      html += `<div style="border: 1px solid #444; padding: 10px; border-radius: 4px;">
                 <h3 style="margin-top:0; color: var(--accent-color);">${c.nome}</h3>
                 <p style="font-size:0.9rem; color:#ccc;">${c.descricao}</p>
                 <span style="font-size:0.8rem; color:#888;">Arma Inicial: ${c.armaInicial}</span>
               </div>`;
    });

    if (classesBloq.length > 0) {
      html += `<h2>Classes Bloqueadas</h2>`;
      classesBloq.forEach(c => {
        const reqStr = c.mensagemRequisito || `Alcançar Andar ${c.andarDesbloqueio}`;
        html += `<div style="border: 1px solid #444; padding: 10px; border-radius: 4px; opacity: 0.6;">
                   <h3 style="margin-top:0; color: #888;">???</h3>
                   <span style="font-size:0.8rem; color:#888;">Requisito: ${reqStr}</span>
                 </div>`;
      });
    }

    html += `</div>`;
    html += `<button class="btn-action" id="btn-classes-voltar">Voltar</button>`;
    app.innerHTML = html;
    document.getElementById("btn-classes-voltar")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    return;
  }

  if (estadoAtual === "LOJA") {
    const save = lerSave();
    const classesDisp = getClassesDisponiveis(save).map(c => c.nome);

    const armasAVenda = Object.values(listaArmas).filter(a => {
      if (a.price <= 0) return false;
      // Esconder armas específicas se a classe não estiver desbloqueada
      if (a.name === "Trompete do Bardo" && !classesDisp.includes("Bardo")) return false;
      if (a.name === "Tomo Antigo" && !classesDisp.includes("Necromante")) return false;
      return true;
    });

    let html = `
      <h2>Loja <span style="color:#aaa; font-size:1rem;">(Ouro Global: ${save.gold}G)</span></h2>
      <div style="display:flex; gap:10px; margin-bottom:16px;">
        <button class="btn-action" id="btn-aba-comprar" style="${lojaAba === 'comprar' ? 'border-color: var(--accent-color); color: var(--accent-color);' : ''}">🛒 Comprar</button>
        <button class="btn-action" id="btn-aba-vender" style="${lojaAba === 'vender' ? 'border-color: #ff6b6b; color: #ff6b6b;' : ''}">💰 Vender</button>
      </div>
    `;

    if (lojaAba === "comprar") {
      html += `<div class="action-buttons" style="flex-direction:column;">`;
      html += `<h3>Armas</h3>`;
      armasAVenda.forEach((arma, idx) => {
        const comprado = save.armasExtras.includes(arma.name);
        if (comprado) {
          html += `<div class="has-tooltip btn-action-container" style="margin-bottom:5px;"><button class="btn-action" disabled>${arma.name} — Comprado</button>${getWeaponTooltip(arma)}</div>`;
        } else {
          html += `<div class="has-tooltip btn-action-container" style="margin-bottom:5px;"><button class="btn-action" id="btn-comprar-arma-${idx}">${arma.name} (${arma.raridade}) — ${arma.price}G</button>${getWeaponTooltip(arma)}</div>`;
        }
      });
      html += `<h3 style="margin-top:12px;">Consumíveis</h3>`;
      Object.values(listaConsumiveis).forEach((cons, idx) => {
        const preco = (cons as any).price || 30;
        const qtd = save.consumiveisExtras.filter(nome => nome === cons.name).length;
        const txtQtd = qtd > 0 ? ` (${qtd}x)` : "";
        html += `<button class="btn-action" id="btn-comprar-cons-${idx}">${cons.name}${txtQtd} — ${preco}G</button>`;
      });
      html += `</div>`;
    } else {
      // Aba de Venda
      html += `<div class="action-buttons" style="flex-direction:column;">`;

      let armasVenda: typeof jogador.weaponInventory = [];
      let consVenda: string[] = [];

      if (jogador) {
        armasVenda = jogador.weaponInventory.filter(a => a.name !== "Espada Quebrada");
        consVenda = jogador.inventory;
      } else {
        armasVenda = save.armasExtras.map(nome => listaArmas[nome]).filter(a => a !== undefined) as typeof jogador.weaponInventory;
        consVenda = save.consumiveisExtras;
      }

      if (armasVenda.length > 0) {
        html += `<h3>Armas no Inventário</h3>`;
        armasVenda.forEach((arma, idx) => {
          const precoVenda = PRECO_REVENDA[arma.raridade] ?? 50;
          const isEquipada = jogador ? jogador.equippedWeapon?.name === arma.name : false;
          if (isEquipada) {
            html += `<div class="has-tooltip btn-action-container" style="margin-bottom:5px;"><button class="btn-action" disabled style="opacity:0.5;">${arma.name} (${arma.raridade}) — Equipada</button>${getWeaponTooltip(arma)}</div>`;
          } else {
            html += `<div class="has-tooltip btn-action-container" style="margin-bottom:5px;"><button class="btn-action" id="btn-vender-arma-${idx}" style="border-color:#c92a2a;">${arma.name} (${arma.raridade}) — Vender por ${precoVenda}G</button>${getWeaponTooltip(arma)}</div>`;
          }
        });
      } else {
        html += `<p style="color:#aaa;">Nenhuma arma para vender.</p>`;
      }

      if (consVenda.length > 0) {
        html += `<h3 style="margin-top:12px;">Consumíveis</h3>`;
        const inventarioUnico = [...new Set(consVenda)];
        inventarioUnico.forEach((nomeItem, idx) => {
          const qtd = consVenda.filter(i => i === nomeItem).length;
          html += `<button class="btn-action" id="btn-vender-cons-${idx}" style="border-color:#c92a2a;">${nomeItem} (x${qtd}) — Vender 1 por 40G</button>`;
        });
      } else {
        html += `<p style="color:#aaa;">Nenhum consumível para vender.</p>`;
      }

      html += `</div>`;
    }

    html += `<button class="btn-action" style="margin-top:20px;" id="btn-loja-voltar">Voltar</button>`;
    app.innerHTML = html;

    // Listeners — Abas
    document.getElementById("btn-aba-comprar")!.onclick = () => { lojaAba = "comprar"; render(); };
    document.getElementById("btn-aba-vender")!.onclick = () => { lojaAba = "vender"; render(); };

    if (lojaAba === "comprar") {
      armasAVenda.forEach((arma, idx) => {
        const comprado = save.armasExtras.includes(arma.name);
        if (!comprado) {
          document.getElementById(`btn-comprar-arma-${idx}`)!.onclick = () => {
            if (gastarGold(arma.price)) {
              adicionarArmaExtra(arma.name);
              render();
            } else {
              alert("Ouro insuficiente!");
            }
          };
        }
      });
      Object.values(listaConsumiveis).forEach((cons, idx) => {
        document.getElementById(`btn-comprar-cons-${idx}`)!.onclick = () => {
          const preco = (cons as any).price || 30;
          if (gastarGold(preco)) {
            adicionarConsumivelExtra(cons.name);
            render();
          } else {
            alert("Ouro insuficiente!");
          }
        };
      });
    } else {
      // Listeners — Venda
      let armasVenda: typeof jogador.weaponInventory = [];
      let consVenda: string[] = [];

      if (jogador) {
        armasVenda = jogador.weaponInventory.filter(a => a.name !== "Espada Quebrada");
        consVenda = jogador.inventory;
      } else {
        armasVenda = save.armasExtras.map(nome => listaArmas[nome]).filter(a => a !== undefined) as typeof jogador.weaponInventory;
        consVenda = save.consumiveisExtras;
      }

      armasVenda.forEach((arma, idx) => {
        const isEquipada = jogador ? jogador.equippedWeapon?.name === arma.name : false;
        if (!isEquipada) {
          document.getElementById(`btn-vender-arma-${idx}`)!.onclick = () => {
            const precoVenda = PRECO_REVENDA[arma.raridade] ?? 50;
            const raridadesAlta = ["EPICA", "LENDARIA", "UNICA"];
            if (raridadesAlta.includes(arma.raridade)) {
              itemParaConfirmarVenda = { tipo: "arma", nome: arma.name, raridade: arma.raridade, preco: precoVenda };
              estadoAtual = "CONFIRMAR_VENDA";
              render();
            } else {
              if (jogador) {
                jogador.weaponInventory = jogador.weaponInventory.filter((_, i) => i !== jogador.weaponInventory.indexOf(arma));
              } else {
                const i = save.armasExtras.indexOf(arma.name);
                if (i !== -1) save.armasExtras.splice(i, 1);
                salvarSave(save);
              }
              adicionarGold(precoVenda);
              render();
            }
          };
        }
      });

      const inventarioUnico = [...new Set(consVenda)];
      inventarioUnico.forEach((nomeItem, idx) => {
        document.getElementById(`btn-vender-cons-${idx}`)!.onclick = () => {
          if (jogador) {
            const i = jogador.inventory.indexOf(nomeItem);
            if (i !== -1) jogador.inventory.splice(i, 1);
          } else {
            const i = save.consumiveisExtras.indexOf(nomeItem);
            if (i !== -1) save.consumiveisExtras.splice(i, 1);
            salvarSave(save);
          }
          adicionarGold(40);
          render();
        };
      });
    }

    document.getElementById("btn-loja-voltar")!.onclick = () => { lojaAba = "comprar"; estadoAtual = "LOBBY"; render(); };
    return;
  }

  if (estadoAtual === "CONFIRMAR_VENDA" && itemParaConfirmarVenda) {
    const item = itemParaConfirmarVenda;
    const corRaridade = item.raridade === "UNICA" ? "#f06595" : item.raridade === "LENDARIA" ? "#fcc419" : "#cc5de8";
    app.innerHTML = `
      <div class="hud-container" style="text-align: center; max-width: 400px; margin: 0 auto;">
        <h2 style="color: ${corRaridade};">⚠️ Confirmar Venda</h2>
        <p>Tem certeza que quer vender</p>
        <p><strong style="color: ${corRaridade}; font-size: 1.3rem;">${item.nome}</strong></p>
        <p style="color: #aaa;">(${item.raridade}) por <strong style="color: var(--accent-color);">${item.preco}G</strong>?</p>
        <div style="display:flex; gap:10px; justify-content: center; margin-top: 20px;">
          <button class="btn-action" id="btn-confirmar-venda" style="border-color: #c92a2a; color: #ff6b6b;">Vender</button>
          <button class="btn-action" id="btn-cancelar-venda">Cancelar</button>
        </div>
      </div>
    `;
    document.getElementById("btn-confirmar-venda")!.onclick = () => {
      if (jogador) {
        if (item.tipo === "arma") {
          jogador.weaponInventory = jogador.weaponInventory.filter(a => a.name !== item.nome);
          if (jogador.equippedWeapon?.name === item.nome) {
            jogador.equippedWeapon = jogador.weaponInventory[0] ?? listaArmas["Espada Quebrada"]!;
          }
        } else {
          const i = jogador.inventory.indexOf(item.nome);
          if (i !== -1) jogador.inventory.splice(i, 1);
        }
      } else {
        const save = lerSave();
        if (item.tipo === "arma") {
          const i = save.armasExtras.indexOf(item.nome);
          if (i !== -1) save.armasExtras.splice(i, 1);
        } else {
          const i = save.consumiveisExtras.indexOf(item.nome);
          if (i !== -1) save.consumiveisExtras.splice(i, 1);
        }
        salvarSave(save);
      }
      adicionarGold(item.preco);
      itemParaConfirmarVenda = null;
      estadoAtual = "LOJA";
      render();
    };
    document.getElementById("btn-cancelar-venda")!.onclick = () => {
      itemParaConfirmarVenda = null;
      estadoAtual = "LOJA";
      render();
    };
    return;
  }

  if (estadoAtual === "SOBRE") {
    app.innerHTML = `
      <div class="hud-container" style="text-align: left; max-width: 600px; margin: 0 auto; color: #ddd; font-family: 'Geist Pixel', monospace; font-size: 1.1rem; line-height: 1.5;">
        <h2 class="hud-title" style="text-align: center; font-size: 2rem;">Sobre o RogueText</h2>
        
        <p><strong>RogueText</strong> é um jogo RPG Roguelite baseado em turnos inspirado em clássicos de exploração de masmorras com foco no sistema de extração.</p>
        
        <h3 style="color: var(--accent-color); margin-top: 20px;">Como Jogar</h3>
        <ul>
          <li><strong>Exploração:</strong> Avance por salas derrotando inimigos. Cada andar contém 9 salas de monstros e 1 sala de Chefe (Sala 10).</li>
          <li><strong>Batalha:</strong> Use Ataques básicos, Habilidades ou Itens do seu inventário. Ficar sem vida significa o fim da run (Permadeath)!</li>
          <li><strong>Level Up:</strong> Ao ganhar XP suficiente e subir de nível, você escolhe uma Habilidade nova e ganha um Ponto de Atributo (Força, Destreza, Inteligência, Defesa ou Sorte).</li>
          <li><strong>Extração (Fuga):</strong> O jogo foca muito em gerenciamento de risco. Você sempre tem a opção de "Fugir" nas batalhas para tentar voltar ao lobby vivo e levar seu loot (Ouro) intacto. Se você for ganancioso e acabar morrendo, você perde metade de todo o seu ouro e todos os seus itens que você adquiriu na run!</li>
          <li><strong>Baús:</strong> Derrotar o Chefe do andar recompensa você com um Baú (Comum a Único), que pode conter armas poderosas ou itens consumíveis.</li>
          <li><strong>Loja:</strong> Gaste seu ouro no Lobby para desbloquear novas Armas e Consumíveis permanentes para as próximas runs.</li>
        </ul>
        
        <h3 style="color: var(--accent-color); margin-top: 20px;">Dicas</h3>
        <p>Habilidades escalam com diferentes atributos. Leia as descrições passando o mouse sobre elas. E lembre-se: saber a hora de parar e extrair é o segredo do sucesso!</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <button class="btn-lobby" id="btn-voltar-lobby">Voltar ao Lobby</button>
        </div>
      </div>
    `;
    document.getElementById("btn-voltar-lobby")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    return;
  }

  if (estadoAtual === "MOCHILA") {
    const save = lerSave();
    const drops = lerDrops();
    const dropNomes = Object.keys(drops);

    // Coletar todas as armas disponíveis
    const armasBase = ["Espada Quebrada"];
    const todasArmas = [...new Set([...armasBase, ...save.armasExtras])]
      .map(n => listaArmas[n])
      .filter(Boolean);

    // Coletar todas as armaduras disponíveis
    const armadurasBase = ["Robes Rasgados", "Vestes de Couro"];
    const todasArmaduras = [...new Set([...armadurasBase, ...save.armadurasExtras])]
      .map(n => listaArmaduras[n])
      .filter(Boolean);

    // Coletar todos os acessórios disponíveis
    const acessoriosBase = ["Sem Acessório", "Amuleto da Vitalidade", "Anel da Força", "Anel da Sorte"];
    const todosAcessorios = [...new Set([...acessoriosBase, ...save.acessoriosExtras])]
      .map(n => listaAcessorios[n])
      .filter(Boolean);

    // Coletar todos os consumíveis
    const todosConsumiveis = save.consumiveisExtras
      .map(n => listaConsumiveis[n])
      .filter(Boolean);

    const rarColor: Record<string, string> = {
      "COMUM": "#aaa",
      "RARA": "#339af0",
      "EPICA": "#cc5de8",
      "LENDARIA": "#fcc419"
    };

    function cardItem(nome: string, sub: string, rar: string, tooltipHtml?: string) {
      const cor = rarColor[rar] ?? "#aaa";
      return `
        <div class="${tooltipHtml ? 'has-tooltip' : ''}" style="background:rgba(255,255,255,0.05); border:1px solid #444; border-radius:6px; padding:8px 12px; position:relative;">
          <div style="color:${cor}; font-weight:bold; font-size:0.9rem;">${nome}</div>
          <div style="color:#888; font-size:0.8rem; margin-top:2px;">${sub}</div>
          ${tooltipHtml || ''}
        </div>`;
    }

    const armasHTML = todasArmas.length > 0
      ? todasArmas.map(a => cardItem(a!.name, `${a!.damage} dano base | ${a!.raridade}`, a!.raridade, getWeaponTooltip(a))).join("")
      : `<p style="color:#666; font-size:0.85rem;">Nenhuma arma disponível.</p>`;

    const armadurasHTML = todasArmaduras.length > 0
      ? todasArmaduras.map(a => cardItem(a!.name, `+${a!.bonusVida}HP +${a!.bonusDefesa}DEF${a!.passiva ? ` | ${a!.passiva.nome}` : ""}`, a!.raridade)).join("")
      : `<p style="color:#666; font-size:0.85rem;">Nenhuma armadura disponível.</p>`;

    const acessoriosHTML = todosAcessorios.length > 0
      ? todosAcessorios.map(a => {
        const bonus = a!.bonusStats
          ? Object.entries(a!.bonusStats).map(([k, v]) => `+${v} ${k}`).join(" ")
          : (a!.passiva?.nome ?? "Sem bônus");
        return cardItem(a!.name, bonus, a!.raridade);
      }).join("")
      : `<p style="color:#666; font-size:0.85rem;">Nenhum acessório disponível.</p>`;

    const consumiveisHTML = todosConsumiveis.length > 0
      ? todosConsumiveis.map(c => cardItem(c!.name, c!.description ?? "", (c as any).raridade ?? "COMUM")).join("")
      : `<p style="color:#666; font-size:0.85rem;">Nenhum consumível no estoque.</p>`;

    const materiaisHTML = dropNomes.length > 0
      ? `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px;">${dropNomes.sort().map(nome =>
        `<div style="background:rgba(255,255,255,0.04); border:1px solid #3a3a3a; border-radius:5px; padding:6px 10px; display:flex; justify-content:space-between; align-items:center;">
              <span style="color:#e0c88a; font-size:0.85rem;">${nome}</span>
              <span style="background:#333; color:#fff; border-radius:4px; padding:1px 7px; font-size:0.85rem;">x${drops[nome]}</span>
            </div>`
      ).join("")
      }</div>`
      : `<p style="color:#666; font-size:0.85rem;">Nenhum material coletado ainda.</p>`;

    function secao(titulo: string, icone: string, cor: string, conteudo: string) {
      return `
        <div style="margin-bottom:24px;">
          <h3 style="color:${cor}; margin:0 0 10px 0; font-size:1.1rem; border-bottom:1px solid #333; padding-bottom:6px; display:flex; align-items:center; height:44px;">${icone} ${titulo}</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">${conteudo}</div>
        </div>`;
    }

    app.innerHTML = `
      <div class="hud-container" style="text-align:left; max-width:800px; margin:0 auto; color:#ddd;">
        <h2 class="hud-title" style="text-align:center; font-size:2rem; margin-bottom:4px;">Mochila</h2>
        <p style="text-align:center; color:#666; font-size:0.85rem; margin-bottom:20px;">Todos os seus itens e materiais.</p>

        ${secao("Armas", `<img src="sprites/weapon-icon.png" style="width:44px; height:44px; margin-right:6px;" alt="⚔️">`, "#ffd43b", armasHTML)}
        ${secao("Armaduras", `<img src="sprites/shield-icon.png" style="width:32px; height:32px; margin-right:6px;" alt="🛡️">`, "#74c0fc", armadurasHTML)}
        ${secao("Acessórios", `<img src="sprites/acessory-icon.png" style="width:32px; height:32px; margin-right:6px;" alt="💍">`, "#a9e34b", acessoriosHTML)}
        ${secao("Consumíveis", "", "#ff8787", consumiveisHTML)}

        <div style="margin-bottom:24px;">
          <h3 style="color:#e0c88a; margin:0 0 10px 0; font-size:1.1rem; border-bottom:1px solid #333; padding-bottom:6px;">Materiais de Crafting</h3>
          ${materiaisHTML}
        </div>

        <div style="text-align:center; margin-top:20px;">
          <button class="btn-lobby" id="btn-voltar-mochila">Voltar ao Lobby</button>
        </div>
      </div>
    `;
    document.getElementById("btn-voltar-mochila")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    return;
  }

  if (estadoAtual === "FERREIRO") {
    const drops = lerDrops();
    const save = lerSave();
    const craftableArmaduras = Object.values(listaArmaduras).filter((a: import("./artefacts").IArmadura) => a.receita);
    const craftableAcessorios = Object.values(listaAcessorios).filter((a: import("./artefacts").IAcessorio) => a.receita);

    function checkPodeCraftar(receita: Record<string, number>): boolean {
      for (const [mat, qtdReq] of Object.entries(receita)) {
        if ((drops[mat] ?? 0) < qtdReq) return false;
      }
      return true;
    }

    function formataReceita(receita: Record<string, number>): string {
      return Object.entries(receita).map(([mat, qtdReq]) => {
        const qtdPossui = drops[mat] ?? 0;
        const color = qtdPossui >= qtdReq ? "#a9e34b" : "#ff6b6b";
        return `<span style="color:${color}">${mat}: ${qtdPossui}/${qtdReq}</span>`;
      }).join(" | ");
    }

    let html = `
      <div class="hud-container" style="text-align: left; max-width: 800px; margin: 0 auto; color: #ddd;">
        <h2 class="hud-title" style="text-align: center; font-size: 2rem;">🔨 Fornalha do Ferreiro</h2>
        <p style="text-align: center; color: #888; font-size: 0.9rem;">Crie novos equipamentos poderosos usando materiais dos monstros.</p>
        
        <h3 style="color:#74c0fc; margin-top: 20px; display:flex; align-items:center; height:44px;"><img src="sprites/shield-icon.png" style="width:32px; height:32px; margin-right:6px;" alt="🛡️"> Armaduras</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    craftableArmaduras.forEach((a, idx) => {
      const jaTem = save.armadurasExtras.includes(a.name);
      const podeCraftar = !jaTem && checkPodeCraftar(a.receita!);
      html += `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid #444; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #ffd43b;">${a.name}</strong><br>
            <small style="color: #bbb;">${a.description}</small><br>
            <small style="font-size: 0.8rem;">Receita: ${formataReceita(a.receita!)}</small>
          </div>
          <button id="btn-craft-arm-${idx}" class="btn-lobby" style="padding: 8px 15px; font-size: 0.9rem;" ${!podeCraftar ? "disabled" : ""}>
            ${jaTem ? "Já Possui" : "Forjar"}
          </button>
        </div>
      `;
    });

    html += `
        </div>
        <h3 style="color:#a9e34b; margin-top: 20px; display:flex; align-items:center; height:44px;"><img src="sprites/acessory-icon.png" style="width:32px; height:32px; margin-right:6px;" alt="💍"> Acessórios</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
    `;
    craftableAcessorios.forEach((a, idx) => {
      const jaTem = save.acessoriosExtras.includes(a.name);
      const podeCraftar = !jaTem && checkPodeCraftar(a.receita!);
      html += `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid #444; border-radius: 6px; padding: 10px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <strong style="color: #ffd43b;">${a.name}</strong><br>
            <small style="color: #bbb;">${a.description}</small><br>
            <small style="font-size: 0.8rem;">Receita: ${formataReceita(a.receita!)}</small>
          </div>
          <button id="btn-craft-acc-${idx}" class="btn-lobby" style="padding: 8px 15px; font-size: 0.9rem;" ${!podeCraftar ? "disabled" : ""}>
            ${jaTem ? "Já Possui" : "Forjar"}
          </button>
        </div>
      `;
    });

    html += `
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <button class="btn-lobby" id="btn-voltar-ferreiro">Voltar ao Lobby</button>
        </div>
      </div>
    `;

    app.innerHTML = html;

    craftableArmaduras.forEach((a, idx) => {
      const btn = document.getElementById(`btn-craft-arm-${idx}`);
      if (btn && !btn.hasAttribute("disabled")) {
        btn.onclick = () => {
          consumirDrops(a.receita!);
          adicionarArmaduraExtra(a.name);
          render();
        };
      }
    });
    craftableAcessorios.forEach((a, idx) => {
      const btn = document.getElementById(`btn-craft-acc-${idx}`);
      if (btn && !btn.hasAttribute("disabled")) {
        btn.onclick = () => {
          consumirDrops(a.receita!);
          adicionarAcessorioExtra(a.name);
          render();
        };
      }
    });

    document.getElementById("btn-voltar-ferreiro")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    return;
  }

  if (estadoAtual === "MARCOS") {
    const save = lerSave();
    const maxFloor = save.andarMaxAlcancado;
    let html = `<h2>Marcos Alcançados</h2><div style="text-align:left; color:#ccc; max-width:600px; margin: 0 auto;">`;

    html += `<div style="margin-bottom:15px; padding:10px; border:1px solid ${maxFloor >= 5 ? '#ffd700' : '#444'}; border-radius: 8px;">
      <h3 style="color:${maxFloor >= 5 ? '#ffd700' : '#777'}">Marco 1 (Andar 5) - ${maxFloor >= 5 ? 'Desbloqueado!' : 'Bloqueado'}</h3>
      <p>Libera 1 espaço adicional de acessório no loadout (2 espaços).</p>
    </div>`;

    html += `<div style="margin-bottom:15px; padding:10px; border:1px solid ${maxFloor >= 7 ? '#ffd700' : '#444'}; border-radius: 8px;">
      <h3 style="color:${maxFloor >= 7 ? '#ffd700' : '#777'}">Marco 2 (Andar 7) - ${maxFloor >= 7 ? 'Desbloqueado!' : 'Bloqueado'}</h3>
      <p>Libera o Espaço Seguro no loadout. O item Seguro não é perdido se você morrer antes do andar 7.</p>
    </div>`;

    html += `<div style="margin-bottom:15px; padding:10px; border:1px solid ${maxFloor >= 10 ? '#ffd700' : '#444'}; border-radius: 8px;">
      <h3 style="color:${maxFloor >= 10 ? '#ffd700' : '#777'}">Marco 3 (Andar 10) - ${maxFloor >= 10 ? 'Desbloqueado!' : 'Bloqueado'}</h3>
      <p>Libera o 3º espaço de acessório no loadout (3 espaços).</p>
    </div>`;

    html += `<div style="margin-bottom:15px; padding:10px; border:1px solid ${temFlag('marco_10_parrys') ? '#ffd700' : '#444'}; border-radius: 8px;">
      <h3 style="color:${temFlag('marco_10_parrys') ? '#ffd700' : '#777'}">Marco 4 (Mestre do Parry) - ${temFlag('marco_10_parrys') ? 'Desbloqueado!' : 'Bloqueado'}</h3>
      <p>Condição: Atinja uma streak de 10 parrys seguidos.<br>Recompensa: +3 de Destreza permanente em qualquer classe.</p>
    </div>`;

    html += `</div>
      <div style="margin-top:20px; text-align: center;">
        <button class="btn-lobby" id="btn-voltar-marcos" style="padding: 10px 20px;">Voltar ao Lobby</button>
      </div>
    `;
    app.innerHTML = html;
    document.getElementById("btn-voltar-marcos")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    return;
  }

  if (estadoAtual === "SELECAO_CLASSE") {
    const save = lerSave();
    const disponiveis = getClassesDisponiveis(save);
    const bloqueadas = getClassesBloqueadas(save);

    let html = `
      <div style="max-width: 900px; margin: 0 auto; padding-top: 10vh; text-align: center;">
        <h2 style="font-size: 2rem; margin-bottom: 30px; color: #fff;">Selecione sua Classe</h2>
        <div class="action-buttons" style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; text-align: left;">
    `;
    disponiveis.forEach((classe, idx) => {
      html += `<button class="btn-action" id="btn-classe-${idx}" style="flex: 1; min-width: 250px; padding: 20px; cursor: pointer; transition: all 0.2s;">
        <span class="key-hint" style="color: #ffd43b;">[${idx + 1}]</span> 
        <span style="font-size: 1.2rem; color: #fff;">${classe.nome}</span><br>
        <small class="text-gray" style="display: block; margin-top: 10px; font-size: 0.9rem; line-height: 1.4;">${classe.descricao}</small>
      </button>`;
    });
    html += `</div></div>`;

    app.innerHTML = html;

    disponiveis.forEach((classe, idx) => {
      document.getElementById(`btn-classe-${idx}`)!.onclick = () => {
        aplicarClasse(jogador, classe);

        const saveFastTravel = lerSave();
        const andaresDisponiveis = Object.keys(saveFastTravel.historicoAndares || {})
          .map(Number)
          .filter(a => (saveFastTravel.historicoAndares?.[a] ?? 0) >= 10 && a > 1)
          .sort((a, b) => b - a);

        if (andaresDisponiveis.length > 0) {
          estadoAtual = "FAST_TRAVEL";
          render();
        } else {
          iniciarExploracaoBase();
        }
      };
    });

    // Eventos de teclado (1-3)
    window.onkeydown = (e) => {
      const num = parseInt(e.key) - 1;
      if (num >= 0 && num < disponiveis.length) {
        document.getElementById(`btn-classe-${num}`)?.click();
      }
    };
    return;
  }

  if (estadoAtual === "FAST_TRAVEL") {
    const saveFastTravel = lerSave();
    const andaresDisponiveis = Object.keys(saveFastTravel.historicoAndares || {})
      .map(Number)
      .filter(a => (saveFastTravel.historicoAndares?.[a] ?? 0) >= 10 && a > 1)
      .sort((a, b) => b - a);

    let html = `
      <div style="max-width:600px; margin:0 auto; text-align:center;">
        <h2 style="color:#ffd700;">Viagem Rápida (Fast Travel)</h2>
        <p style="color:#bbb; margin-bottom: 20px;">Você dominou os primeiros andares da masmorra. Deseja pular diretamente para um andar avançado? Todo o XP e Ouro até lá serão calculados e entregues a você!</p>
        
        <div style="display:flex; flex-direction:column; gap:10px;">
          <button class="btn-action" id="btn-fast-travel-1" style="border-color:#aaa;">
            Começar do Andar 1 (Padrão)
          </button>
    `;

    andaresDisponiveis.forEach(a => {
      const sim = simularRunAte(a);
      html += `
          <button class="btn-action" id="btn-fast-travel-${a}" style="border-color:#4dabf7;">
            Pular para o Andar ${a}<br>
            <small style="color:#a9e34b;">Simulação: +${sim.xp} XP | +${sim.gold} Ouro</small>
          </button>
       `;
    });

    html += `</div></div>`;
    app.innerHTML = html;

    document.getElementById("btn-fast-travel-1")!.onclick = () => {
      iniciarExploracaoBase();
    };

    andaresDisponiveis.forEach(a => {
      document.getElementById(`btn-fast-travel-${a}`)!.onclick = () => {
        const sim = simularRunAte(a);
        jogador.experience += sim.xp;
        jogador.gold += sim.gold;
        andarAtual = a;
        salaAtual = 0;
        atualizarAndarMax(andarAtual);
        registrarChegadaAndar(andarAtual);

        let nivelUp = 0;
        while (jogador.experience >= jogador.experienceToNextLevel) {
          jogador.levelUp();
          nivelUp++;
        }

        if (nivelUp > 0) {
          skillsPendenteDeEscolha = nivelUp;
          (jogador as any)._afterLevelUpAction = () => {
            estadoAtual = "EXPLORACAO";
            opcoesAcao = [{ texto: "Avançar para próxima sala", acao: () => avancarSala() }];
            atualizarLog(`Você pulou para o Andar ${a} e ganhou ${sim.xp} XP / ${sim.gold}G!`);
            render();
          };
          estadoAtual = "LEVEL_UP_SCREEN";
          atualizarLog(`Você pulou para o Andar ${a} e ganhou ${sim.xp} XP / ${sim.gold}G!`, () => {
            setTimeout(() => irParaTelaLevelUp(), 800);
          });
        } else {
          estadoAtual = "EXPLORACAO";
          opcoesAcao = [{ texto: "Avançar para próxima sala", acao: () => avancarSala() }];
          atualizarLog(`Você pulou para o Andar ${a} e ganhou ${sim.xp} XP / ${sim.gold}G!`);
          render();
        }
      };
    });
    return;
  }

  if (estadoAtual === "SELECAO_LOADOUT") {
    const save = lerSave();
    const loadoutAtual = lerLoadout();

    // Constroi a lista de armas disponiveis (inicial + desbloqueadas no save)
    const armasDisponiveis = ["Espada Quebrada", ...save.armasExtras]
      .filter((name, i, arr) => arr.indexOf(name) === i)
      .map(name => listaArmas[name])
      .filter(Boolean) as import("./artefacts").IWeapons[];

    const armadurasBasicas = ["Robes Rasgados", "Vestes de Couro"];
    const acessoriosBasicos = ["Sem Acessório", "Amuleto da Vitalidade", "Anel da Força", "Anel da Sorte"];

    const armadurasDisponiveis = [...armadurasBasicas, ...save.armadurasExtras]
      .filter((name, i, arr) => arr.indexOf(name) === i)
      .map(name => listaArmaduras[name])
      .filter(Boolean) as import("./artefacts").IArmadura[];

    const acessoriosDisponiveis = [...acessoriosBasicos, ...save.acessoriosExtras]
      .filter((name, i, arr) => arr.indexOf(name) === i)
      .map(name => listaAcessorios[name])
      .filter(Boolean) as import("./artefacts").IAcessorio[];

    const maxAcessorios = save.andarMaxAlcancado >= 10 ? 3 : (save.andarMaxAlcancado >= 5 ? 2 : 1);
    const temEspacoSeguro = save.andarMaxAlcancado >= 7;

    let selectedArma = loadoutAtual.arma;
    let selectedArmadura = loadoutAtual.armadura;
    let selectedAcessorios = [...loadoutAtual.acessorios];
    // Garante que o array tenha o tamanho certo
    while (selectedAcessorios.length < maxAcessorios) selectedAcessorios.push("Sem Acessório");
    if (selectedAcessorios.length > maxAcessorios) selectedAcessorios = selectedAcessorios.slice(0, maxAcessorios);

    let selectedItemSeguro: string | undefined = loadoutAtual.itemSeguro;

    const rarColor: Record<string, string> = {
      COMUM: "#aaa", RARA: "#4dabf7", EPICA: "#cc5de8", LENDARIA: "#ffd43b", UNICA: "#ff6b6b"
    };

    function renderLoadout() {
      const itensSelecionados = [selectedArma, selectedArmadura, ...selectedAcessorios.filter(a => a !== "Sem Acessório")];
      if (selectedItemSeguro && !itensSelecionados.includes(selectedItemSeguro)) {
        selectedItemSeguro = undefined;
      }

      let html = `
        <div style="max-width:850px; margin:0 auto; display:flex; flex-direction:column; gap:20px;">
          <h2 style="text-align:center; margin:0;">🛠️ Configurar Loadout</h2>
          <p style="text-align:center; color:#888; margin:0;">Escolha seu equipamento antes de entrar na masmorra.</p>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px;">
            <!-- ARMAS -->
            <div>
              <h3 style="color:#ffd43b; margin:0 0 8px 0; display:flex; align-items:center; height:44px;"><img src="sprites/weapon-icon.png" style="width:44px; height:44px; margin-right:6px;" alt="⚔️"> Arma</h3>
              ${armasDisponiveis.map(a => `
                <div class="has-tooltip btn-action-container" style="margin-bottom:5px;">
                  <button id="lb-arma-${a.name.replace(/\s/g, '_')}" class="btn-action"
                    style="width:100%; ${selectedArma === a.name ? 'border-color:#ffd43b; background:rgba(255,212,59,0.15);' : ''}">
                    <span style="color:${rarColor[a.raridade] ?? '#aaa'};">${a.name}</span><br>
                    <small>${a.damage} base | ${a.raridade}</small>
                  </button>
                  ${getWeaponTooltip(a)}
                </div>`).join('')}
            </div>
            <!-- ARMADURAS -->
            <div>
              <h3 style="color:#74c0fc; margin:0 0 8px 0; display:flex; align-items:center; height:44px;"><img src="sprites/shield-icon.png" style="width:32px; height:32px; margin-right:6px;" alt="🛡️"> Armadura</h3>
              ${armadurasDisponiveis.map(a => `
                <button id="lb-arm-${a.name.replace(/\s/g, '_')}" class="btn-action"
                  style="width:100%; margin-bottom:5px; ${selectedArmadura === a.name ? 'border-color:#74c0fc; background:rgba(116,192,252,0.15);' : ''}">
                  <span style="color:${rarColor[a.raridade] ?? '#aaa'};">${a.name}</span><br>
                  <small>+${a.bonusVida}HP +${a.bonusDefesa}DEF${a.passiva ? ` | ${a.passiva.nome}` : ''}</small>
                </button>`).join('')}
            </div>
            <!-- ACESSORIOS -->
            <div>
              <h3 style="color:#a9e34b; margin:0 0 8px 0; display:flex; align-items:center; height:44px;"><img src="sprites/acessory-icon.png" style="width:32px; height:32px; margin-right:6px;" alt="💍"> Acessórios (${maxAcessorios})</h3>
              ${Array.from({ length: maxAcessorios }).map((_, slotIdx) => `
                <div style="margin-bottom:15px; border:1px dashed #555; padding:5px;">
                  <h4 style="margin:0 0 5px 0; font-size:0.9rem; color:#888;">Slot ${slotIdx + 1}</h4>
                  ${acessoriosDisponiveis.map(a => {
        const isSelectedInOtherSlot = a.name !== "Sem Acessório" && selectedAcessorios.some((sel, sIdx) => sIdx !== slotIdx && sel === a.name);
        return `
                    <button id="lb-acc-${slotIdx}-${a.name.replace(/\s/g, '_')}" class="btn-action"
                      ${isSelectedInOtherSlot ? "disabled" : ""}
                      style="width:100%; margin-bottom:3px; padding: 5px; ${selectedAcessorios[slotIdx] === a.name ? 'border-color:#a9e34b; background:rgba(169,227,75,0.15);' : ''} ${isSelectedInOtherSlot ? 'opacity:0.3; cursor:not-allowed;' : ''}">
                      <span style="font-size:0.9rem; color:${rarColor[a.raridade] ?? '#aaa'};">${a.name}</span>
                    </button>`
      }).join('')}
                </div>
              `).join('')}
            </div>
          </div>

          ${temEspacoSeguro ? `
            <div style="margin-top:10px; border:1px solid #ffd700; padding:10px; border-radius:8px; text-align:center;">
              <h3 style="color:#ffd700; margin:0 0 10px 0; display:flex; align-items:center; justify-content:center;"><img src="sprites/lock-sprite.png" style="width:36px; height:36px; margin-right:8px;" alt="🔒"> Espaço Seguro (Marco 2)</h3>
              <p style="font-size:0.9rem; color:#ccc; margin-bottom:10px;">Escolha 1 item equipado. Ele não será perdido se morrer até o Andar 6.</p>
              <select id="lb-seguro-select" style="padding:8px; background:#222; color:#fff; border:1px solid #555; border-radius:4px; font-size:1rem; width:100%; max-width:400px;">
                <option value="">-- Nenhum --</option>
                ${itensSelecionados.map(i => `<option value="${i}" ${selectedItemSeguro === i ? 'selected' : ''}>${i}</option>`).join('')}
              </select>
            </div>
          ` : ''}

          <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
            <button class="btn-lobby" id="lb-confirmar" style="padding:12px 40px; font-size:1.1rem;">🚀 Confirmar e Continuar</button>
            <button class="btn-lobby" id="lb-voltar" style="padding:12px 20px;">🔙 Voltar ao Lobby</button>
          </div>
        </div>
      `;
      app.innerHTML = html;

      // Eventos das armas
      armasDisponiveis.forEach(a => {
        document.getElementById(`lb-arma-${a.name.replace(/\s/g, '_')}`)!.onclick = () => { selectedArma = a.name; renderLoadout(); };
      });
      // Eventos das armaduras
      armadurasDisponiveis.forEach(a => {
        document.getElementById(`lb-arm-${a.name.replace(/\s/g, '_')}`)!.onclick = () => { selectedArmadura = a.name; renderLoadout(); };
      });
      // Eventos dos acessórios
      for (let slotIdx = 0; slotIdx < maxAcessorios; slotIdx++) {
        acessoriosDisponiveis.forEach(a => {
          document.getElementById(`lb-acc-${slotIdx}-${a.name.replace(/\s/g, '_')}`)!.onclick = () => {
            selectedAcessorios[slotIdx] = a.name;
            renderLoadout();
          };
        });
      }

      if (temEspacoSeguro) {
        document.getElementById("lb-seguro-select")!.onchange = (e) => {
          selectedItemSeguro = (e.target as HTMLSelectElement).value || undefined;
        };
      }

      document.getElementById("lb-confirmar")!.onclick = () => {
        salvarLoadout({ arma: selectedArma, armadura: selectedArmadura, acessorios: selectedAcessorios, itemSeguro: selectedItemSeguro });
        aplicarLoadoutAoJogador();
        estadoAtual = "SELECAO_CLASSE";
        render();
      };
      document.getElementById("lb-voltar")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    }
    renderLoadout();
    return;
  }

  // --- SIDEBAR (HUD Permanente) ---
  const jogadorVidaPerc = Math.max(0, (jogador.life / jogador.maxLife) * 100);
  const prevJogadorVidaPerc = (jogador as any)._lastRenderedVidaPerc ?? jogadorVidaPerc;
  (jogador as any)._lastRenderedVidaPerc = jogadorVidaPerc;

  const jogadorTomouDano = (jogador as any)._lastRenderedLife !== undefined && jogador.life < (jogador as any)._lastRenderedLife;
  (jogador as any)._lastRenderedLife = jogador.life;

  const jHpClass = jogadorTomouDano ? "health-drop animate-width" : "animate-width";
  const jHpShake = jogadorTomouDano ? "shake-hit" : "";

  const jogadorManaPerc = Math.max(0, (jogador.mana / jogador.maxMana) * 100);
  const prevJogadorManaPerc = (jogador as any)._lastRenderedManaPerc ?? jogadorManaPerc;
  (jogador as any)._lastRenderedManaPerc = jogadorManaPerc;

  const jogadorEnergyPerc = Math.max(0, (jogador.energy / jogador.maxEnergy) * 100);
  const prevJogadorEnergyPerc = (jogador as any)._lastRenderedEnergyPerc ?? jogadorEnergyPerc;
  (jogador as any)._lastRenderedEnergyPerc = jogadorEnergyPerc;

  let sidebarHTML = `
    <div class="sidebar-panel">
      <div class="vertical-bars-container">
        <div class="mp-hud-container mp-vertical">
          <div class="mp-hud-fill-wrapper">
            <div class="mp-hud-fill bg-blue animate-width" style="width: ${jogadorManaPerc}%; --prev-width: ${prevJogadorManaPerc}%; --target-width: ${jogadorManaPerc}%;"></div>
          </div>
          <img src="sprites/mana-bar.png" class="mp-hud-frame">
        </div>
        <div class="hp-hud-container hp-vertical ${jHpShake}">
          <div class="hp-hud-fill-wrapper">
            <div class="hp-hud-fill ${jHpClass}" style="background-color: ${getConditionBarColor(jogador.condicoes, "#ff6b6b")}; width: ${jogadorVidaPerc}%; --prev-width: ${prevJogadorVidaPerc}%; --target-width: ${jogadorVidaPerc}%;"></div>
          </div>
          <img src="sprites/hp-bar.png" class="hp-hud-frame">
        </div>
        <div class="ep-hud-container ep-vertical">
          <div class="ep-hud-fill-wrapper">
            <div class="ep-hud-fill bg-yellow animate-width" style="width: ${jogadorEnergyPerc}%; --prev-width: ${prevJogadorEnergyPerc}%; --target-width: ${jogadorEnergyPerc}%;"></div>
          </div>
          <img src="sprites/energy-bar.png" class="ep-hud-frame">
        </div>
      </div>
      <div style="display:flex; justify-content: space-around; font-size:0.85rem; color:#fff; text-shadow: 1px 1px 0 #000; margin-top: -20px; z-index: 10;">
        <span style="color:#74c0fc;">💧 ${Math.round(jogador.mana)}/${Math.round(jogador.maxMana)}</span>
        <span style="color:#ff6b6b;">❤️ ${Math.round(jogador.life)}/${Math.round(jogador.maxLife)}</span>
        <span style="color:#fcc419;">⚡ ${Math.round(jogador.energy)}/${Math.round(jogador.maxEnergy)}</span>
      </div>
      
      <div class="character-sheet-box">
        <div class="char-info-row text-yellow">
          <span>${jogador.name} ${jogador.classe ? `[${jogador.classe}]` : ""} - Nv. ${jogador.level}</span>
          <span style="color:#c2255c;">XP: ${jogador.experience}/${jogador.experienceToNextLevel}</span>
        </div>
        <div class="char-info-row text-yellow" style="margin-top: -5px;">
          <span>Gold: ${jogador.gold}</span>
          <span style="color:#e03131;">Andar ${andarAtual} (Sala ${salaAtual})</span>
        </div>
        
        <div class="char-stats-row" style="margin-top: 10px;">
          <div class="char-stat-col"><span class="text-red">STR</span><span>${jogador.strength}</span></div>
          <div class="char-stat-col"><span class="text-magenta">DEX</span><span>${jogador.dexterity}</span></div>
          <div class="char-stat-col"><span class="text-blue">INT</span><span>${jogador.intelligence}</span></div>
          <div class="char-stat-col"><span class="text-yellow">LUCK</span><span>${jogador.luck}</span></div>
          <div class="char-stat-col"><span class="text-cyan">DEF</span><span>${jogador.defense}</span></div>
        </div>
        
        <div class="char-equip-row" style="margin-top:10px;">
          <img src="sprites/sword-icon.png" style="width:16px;height:16px;">
          <span class="has-tooltip" style="cursor:help;">Arma: ${jogador.equippedWeapon?.name || "Nenhuma"} (${jogador.danoComArma()} dano)
            ${jogador.equippedWeapon ? getWeaponTooltip(jogador.equippedWeapon) : ""}
          </span>
        </div>
        <div class="char-equip-row">
          <img src="sprites/shield-icon.png" style="width:16px;height:16px;">
          <span>${jogador.equippedArmor?.name || "Sem Armadura"}</span>
        </div>
        <div class="char-equip-row">
          <img src="sprites/acessory-icon.png" style="width:16px;height:16px;">
          <span>${jogador.equippedAccessories.length > 0 ? jogador.equippedAccessories.map(a => a.name).join(", ") : "Sem Acessório"}</span>
        </div>
        ${jogador.condicoes.length > 0 ? `<div style="margin-top:5px;">${getConditionIcons(jogador.condicoes)}</div>` : ""}
        ${jogador.skills.filter(s => s.tipo === "PASSIVA").length > 0 ? `
        <div style="margin-top:8px; padding-top:6px; border-top: 1px solid #333;">
          <span style="color:#888; font-size:0.85rem;">Passivas: </span>
          ${jogador.skills.filter(s => s.tipo === "PASSIVA").map(s => {
    const cor = s.raridade === "EPICA" ? "#cc5de8" : s.raridade === "LENDARIA" ? "#fcc419" : s.raridade === "RARA" ? "#339af0" : "#aaa";
    return `<span style="color:${cor}; font-size:0.85rem; margin-right:10px;" title="${s.descricao}">✨ ${s.nome}</span>`;
  }).join("")}
        </div>` : ""}
      </div>
    </div>
  `;

  // --- MAIN PANEL ---
  let mainPanelHTML = `<div class="main-panel">`;

  // Título do Andar
  let titleText = "Masmorra Antiga";
  if (andarAtual > 1) titleText = "Profundezas da Masmorra"; // Lógica customizável depois
  mainPanelHTML += `<div class="floor-title">${titleText}</div>`;

  mainPanelHTML += `<div class="main-content-box">`;

  const isCombat = estadoAtual === "BATALHA";
  mainPanelHTML += `<div class="action-box ${isCombat ? "combat" : ""}">`;

  if (isCombat) {
    mainPanelHTML += `<div class="event-title" style="font-size: 1.5rem; margin-top: 0;">Combate</div>`;
    inimigosAtuais.forEach((ini, idx) => {
      const vidaAtual = Math.max(0, Math.floor(ini.life));
      const porcentagemVida = Math.max(0, (ini.life / ini.maxLife) * 100);
      const prevPorcentagemVida = (ini as any)._lastRenderedVidaPerc ?? porcentagemVida;
      (ini as any)._lastRenderedVidaPerc = porcentagemVida;

      const tomouDano = (ini as any)._lastRenderedLife !== undefined && ini.life < (ini as any)._lastRenderedLife;
      (ini as any)._lastRenderedLife = ini.life;

      mainPanelHTML += `
      <div class="enemy-health-row ${tomouDano ? 'shake-hit' : ''}">
        <div class="enemy-name">(${idx + 1}) ${ini.name} <span style="font-size: 0.9em; margin-left: 5px; vertical-align: -1px;">${getConditionIcons(ini.condicoes)}</span></div>
        <div class="enemy-bar-wrapper">
          <div class="enemy-bar-fill ${tomouDano ? 'health-drop animate-width' : 'animate-width'}" style="background-color: ${getConditionBarColor(ini.condicoes, "#ff4b4b")}; width: ${porcentagemVida}%; --prev-width: ${prevPorcentagemVida}%; --target-width: ${porcentagemVida}%;"></div>
          <div class="enemy-bar-text">${vidaAtual}/${ini.maxLife}</div>
        </div>
      </div>
      `;
    });

    inimigosFugindo.forEach((ini) => {
      mainPanelHTML += `
      <div class="enemy-health-row" style="opacity: 0.5;">
        <div class="enemy-name" style="text-decoration: line-through;">(X) ${ini.name} <span style="color:#fcc419; margin-left: 10px;">(Fugiu de Medo!)</span></div>
        <div class="enemy-bar-wrapper">
          <div class="enemy-bar-fill" style="width: 0%"></div>
          <div class="enemy-bar-text" style="color: #fcc419;">FUGIU</div>
        </div>
      </div>
      `;
    });

    if (aliadosAtuais.length > 0) {
      mainPanelHTML += `<h4 style="color: #9c36b5; margin: 10px 0 5px 0;">Seus Aliados</h4>`;
      aliadosAtuais.forEach((aliado, idx) => {
        const vidaAtual = Math.max(0, Math.floor(aliado.life));
        const porcentagemVida = Math.max(0, (aliado.life / aliado.maxLife) * 100);
        const prevPorcentagemVida = (aliado as any)._lastRenderedVidaPerc ?? porcentagemVida;
        (aliado as any)._lastRenderedVidaPerc = porcentagemVida;

        const tomouDano = (aliado as any)._lastRenderedLife !== undefined && aliado.life < (aliado as any)._lastRenderedLife;
        (aliado as any)._lastRenderedLife = aliado.life;

        mainPanelHTML += `
        <div class="enemy-health-row ${tomouDano ? 'shake-hit' : ''}">
          <div class="enemy-name" style="color: #9c36b5;">[Aliado] ${aliado.name} <span style="font-size: 0.9em; margin-left: 5px; vertical-align: -1px;">${getConditionIcons(aliado.condicoes)}</span></div>
          <div class="enemy-bar-wrapper">
            <div class="enemy-bar-fill ${tomouDano ? 'health-drop animate-width' : 'animate-width'}" style="background-color: #9c36b5; width: ${porcentagemVida}%; --prev-width: ${prevPorcentagemVida}%; --target-width: ${porcentagemVida}%;"></div>
            <div class="enemy-bar-text">${vidaAtual}/${aliado.maxLife}</div>
          </div>
        </div>
        `;
      });
    }

    if (logMensagem) {
      mainPanelHTML += `</div><div style="margin-bottom: 20px; font-size: 1.1rem; color: #ccc; text-align: center;">${logMensagem}</div>`;
    } else {
      mainPanelHTML += `</div>`;
    }

  } else if (estadoAtual === "RESUMO_BATALHA") {
    const contagemInimigos = battleSummary.inimigosDerrotados.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    let monstrosHTML = Object.entries(contagemInimigos).map(([nome, qtd]) => {
      return `<li style="color: #ff6b6b; margin-bottom: 5px;">💀 ${qtd}x ${nome}</li>`;
    }).join("");
    if (monstrosHTML === "") monstrosHTML = `<li style="color: #888;">Nenhum inimigo derrotado.</li>`;

    let dropsHTML = battleSummary.drops.map(d => {
      return `<li style="color: #a9e34b; margin-bottom: 5px;">✨ ${d}</li>`;
    }).join("");
    if (dropsHTML === "") dropsHTML = `<li style="color: #888;">Nenhum material recebido.</li>`;

    mainPanelHTML += `
      <div class="event-title" style="color: #ffd43b; margin-top: 0;">Batalha Vencida!</div>
      <div class="event-subtitle">Estatísticas do combate</div>
      <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px; text-align: left;">
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid #444; flex: 1;">
           <h3 style="color: #ccc; margin-top:0; border-bottom: 1px solid #555; padding-bottom: 5px;">Criaturas Derrotadas</h3>
           <ul style="list-style: none; padding: 0; margin: 0;">${monstrosHTML}</ul>
        </div>
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border: 1px solid #444; flex: 1;">
           <h3 style="color: #ccc; margin-top:0; border-bottom: 1px solid #555; padding-bottom: 5px;">Ganhos</h3>
           <ul style="list-style: none; padding: 0; margin: 0;">
              ${dropsHTML}
              <li style="color: #ffd43b; margin-top: 10px;">💰 +${battleSummary.ouroGanho} Ouro</li>
              <li style="color: #4dabf7;">🔵 +${battleSummary.xpGanho} XP</li>
           </ul>
        </div>
      </div>
    `;
    mainPanelHTML += `</div>`; // Close action-box
  } else if (estadoAtual === "LEVEL_UP_SCREEN") {
    mainPanelHTML += `
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="sprites/Rogue-Text-LevelUp-Icon.gif" class="event-level-up-icon" alt="Event Icon" style="width: 100px; height: 100px; image-rendering: pixelated; margin: 0 auto;">
        <div class="event-title">Você subiu de nível!</div>
        <div class="event-subtitle">
          Escolha suas recompensas:<br>
          <span style="color: #4dabf7;">${skillsPendenteDeEscolha} Habilidades Pendentes</span> | 
          <span style="color: #ffd43b;">${jogador.pontosDeAtributo} Pontos de Atributo</span>
        </div>
      </div>
      <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
    `;
    opcoesAcao.forEach((opcao, idx) => {
      mainPanelHTML += `
        <div class="btn-action-container" style="width: 80%;">
          <button class="action-btn-styled" id="btn-acao-${idx}" style="width: 100%; text-align: left; padding: 15px; font-size: 1.1rem; border: 1px solid #555; background: #222; color: #fff;">
            <span class="key-hint" style="color: #a9e34b; margin-right: 10px;">(${idx + 1})</span> ${opcao.texto}
          </button>
          ${opcao.descricao ? `<div class="btn-tooltip">${opcao.descricao}</div>` : ""}
        </div>
      `;
    });
    mainPanelHTML += `</div>`;
    mainPanelHTML += `</div>`; // Close action-box
  } else {
    // Normal Log / Events
    if (["EVENTO_BOSS", "EVENTO_RECOMPENSA", "ESCOLHA_SALA", "EVENTO_FOGUEIRA", "EVENTO_ALTAR", "EVENTO_PORTAL", "UPGRADE_SKILLS"].includes(estadoAtual)) {
      let tituloEvento = "";
      let subtituloEvento = "";
      let iconeEvento = "";
      if (estadoAtual === "EVENTO_BOSS") {
        tituloEvento = "Cuidado!"; subtituloEvento = "Uma presença esmagadora se aproxima..."; iconeEvento = "sprites/boss-sprite.png";
      } else if (estadoAtual === "EVENTO_RECOMPENSA") {
        tituloEvento = "Recompensa!"; subtituloEvento = "Você encontrou algo interessante.";
      } else if (estadoAtual === "UPGRADE_SKILLS") {
        tituloEvento = "Evolução!"; subtituloEvento = "Você aprimorou suas capacidades de combate.";
      }
      if (iconeEvento) {
        mainPanelHTML += `<div style="text-align: center;"><img src="${iconeEvento}" class="event-level-up-icon" alt="Event Icon"></div>`;
      }
      if (tituloEvento) {
        mainPanelHTML += `<div class="event-title" style="margin-top: 0;">${tituloEvento}</div><div class="event-subtitle">${subtituloEvento}</div>`;
      }
    }

    if (logMensagem) {
      mainPanelHTML += `<div style="font-size: 1.25rem; line-height: 1.6; color: #ddd; text-align: center; margin: auto 0;">${logMensagem}</div></div>`;
    } else {
      mainPanelHTML += `</div>`;
    }
  }

  // Buttons rendering (if not LEVEL_UP_SCREEN, which has its own layout)
  if (estadoAtual !== "LEVEL_UP_SCREEN") {
    mainPanelHTML += `<div class="action-buttons-container">`;
    opcoesAcao.forEach((opcao, idx) => {
      mainPanelHTML += `<div class="btn-action-container">
        <button class="action-btn-styled" id="btn-acao-${idx}">
          <span class="key-hint" style="color: #a9e34b; margin-right: 5px;">(${idx + 1})</span> ${opcao.texto}
        </button>
        ${opcao.descricao ? `<div class="btn-tooltip">${opcao.descricao}</div>` : ""}
      </div>`;
    });
    mainPanelHTML += `</div>`;
  }

  mainPanelHTML += `</div>`; // Close main-content-box

  app.innerHTML = `<div class="game-layout">${sidebarHTML}${mainPanelHTML}</div>`;

  // Event Listeners
  opcoesAcao.forEach((opcao, idx) => {
    document.getElementById(`btn-acao-${idx}`)!.onclick = opcao.acao;
  });

  window.onkeydown = (e) => {
    const num = parseInt(e.key) - 1;
    if (num >= 0 && num < opcoesAcao.length) {
      document.getElementById(`btn-acao-${num}`)?.click();
    }
  };
}

// Lógica do Jogo
function iniciarNovaRun() {
  resetRunStats();
  jogador = new mainCharacter("Herói", 15, 100, 100, 100, 0, 0, 0, 0, 0);
  const save = lerSave();
  save.armasExtras.forEach(armaName => {
    const arma = listaArmas[armaName];
    if (arma) jogador.weaponInventory.push(arma);
  });
  save.consumiveisExtras.forEach(consName => {
    jogador.inventory.push(consName);
  });
  raioNegroStack = 0;
  setParryWindowBonus(0);
  furiaPenalidade = false;
  furiaPenalidadeAtiva = false;
  furiaSkipouPrimeiroTurno = false;
  primeiroTurnoDoCombate = true;
  primeiraSalaCombate = true;
  assassinoCritou = false;
  descricoesUsadasNaRun = new Set();
  andarAtual = 1;
  salaAtual = 0;
  estadoAtual = "SELECAO_LOADOUT";
  render();
}

function aplicarLoadoutAoJogador() {
  const loadout = lerLoadout();
  const arma = listaArmas[loadout.arma];
  if (arma) {
    jogador.equippedWeapon = arma;
    if (!jogador.weaponInventory.includes(arma)) jogador.weaponInventory.push(arma);
  }
  const armadura = listaArmaduras[loadout.armadura];
  if (armadura) jogador.equiparArmadura(armadura);
  loadout.acessorios.forEach(accName => {
    const acessorio = listaAcessorios[accName];
    if (acessorio) jogador.equiparAcessorio(acessorio);
  });
}

function avancarSala() {
  resetBattleSummary();
  if (salaAtual === 7) {
    salaAtual = 1;
    andarAtual++;
    atualizarAndarMax(andarAtual);
    registrarChegadaAndar(andarAtual);
    atualizarLog(`Você avançou para o andar ${andarAtual}, Sala 1!`);
  } else {
    salaAtual++;
    atualizarLog(`Você avançou para a sala ${salaAtual} do andar ${andarAtual}.`);
  }
  gerarInimigos();
}

function gerarInimigos() {
  primeiraSalaCombate = true;
  assassinoCritou = false;
  inimigosAtuais = [];
  inimigosFugindo = [];
  if (salaAtual === 7) {
    playMusic("boss");
    const lista = getBossesPorAndar()[andarAtual];
    if (lista) {
      const bossName = lista[Math.floor(Math.random() * lista.length)]!;
      const bossObj = battleEnemies[bossName as keyof typeof battleEnemies];

      const fatorEscalaATK = Math.pow(1.38, andarAtual - 1);
      const fatorEscalaHP = Math.pow(1.45, andarAtual - 1);
      const finalATK = Math.floor(bossObj.attackPower * 1.3 * fatorEscalaATK * multiplicadorDificuldade);
      const finalHP = Math.floor(bossObj.life * 2.0 * fatorEscalaHP * multiplicadorDificuldade);

      inimigosAtuais.push(new enemy(bossName, finalATK, finalHP, true));
      registrarMonstroVisto(bossName);
    }
  } else {
    playMusic("dungeon");
    let listaInimigos = getMonstrosPorAndar()[andarAtual] || ["Goblin"];
    const temDescricaoEspecifica = salaEscolhidaDescricao && salaEscolhidaDescricao.inimigosRelacionados && salaEscolhidaDescricao.inimigosRelacionados.length > 0;

    const monstrosParaSpawnar: string[] = temDescricaoEspecifica
      ? salaEscolhidaDescricao!.inimigosRelacionados // spawn EXATAMENTE os inimigos da descrição, na ordem
      : Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => listaInimigos[Math.floor(Math.random() * listaInimigos.length)]!);

    for (const monstro of monstrosParaSpawnar) {
      let obj = battleEnemies[monstro as keyof typeof battleEnemies];

      // Fallback in case the name is wrong
      if (!obj) obj = { attackPower: 10, life: 30 } as any;

      const fatorEscalaATK = Math.pow(1.38, andarAtual - 1);
      const fatorEscalaHP = Math.pow(1.45, andarAtual - 1);

      let eliteMultATK = combateAtualIsElite ? 1.5 : 1.0;
      let eliteMultHP = combateAtualIsElite ? 1.5 : 1.0;

      const finalATK = Math.floor(obj.attackPower * fatorEscalaATK * multiplicadorDificuldade * eliteMultATK);
      const finalHP = Math.floor(obj.life * fatorEscalaHP * multiplicadorDificuldade * eliteMultHP);

      inimigosAtuais.push(new enemy(monstro, finalATK, finalHP, false));
      registrarMonstroVisto(monstro);
    }

  }

  salaEscolhidaDescricao = null; // reset for next room

  estadoAtual = "BATALHA";
  if (furiaPenalidade) {
    furiaPenalidadeAtiva = true;
    furiaPenalidade = false;
    furiaSkipouPrimeiroTurno = false;
  } else {
    furiaPenalidadeAtiva = false;
    furiaSkipouPrimeiroTurno = false;
  }

  primeiroTurnoDoCombate = true;

  if (salaAtual === 7) {
    estadoAtual = "EVENTO_BOSS";
    logMensagem = `O ar fica pesado... O Boss ${inimigosAtuais[0]?.name} apareceu!`;
    opcoesAcao = [
      {
        texto: "Enfrentar",
        acao: () => {
          estadoAtual = "BATALHA";
          atualizarLog(`O combate contra ${inimigosAtuais[0]?.name} começou!`);
          menuBatalhaPrincipal();
        }
      }
    ];
    render();
  } else {
    estadoAtual = "BATALHA";
    menuBatalhaPrincipal();
  }
}

function menuBatalhaPrincipal() {
  if (jogador.life <= 0) {
    runStats.resultado = "MORTE";
    runStats.andarDaMorte = andarAtual;
    runStats.salaDaMorte = salaAtual;
    runStats.mortoPor = inimigosAtuais.map(i => i.name).join(", ");
    estadoAtual = "ESTATISTICAS_RUN";
    opcoesAcao = [{ texto: "Ver Relatório", acao: () => render() }];
    const goldPerdido = Math.floor(jogador.gold / 2);
    const goldGanho = jogador.gold - goldPerdido;
    adicionarGold(goldGanho);
    // Perda de itens do loadout na morte (se não forem os básicos)
    const armadurasBasicas = ["Robes Rasgados", "Vestes de Couro"];
    const acessoriosBasicos = ["Sem Acessório", "Amuleto da Vitalidade", "Anel da Força", "Anel da Sorte"];
    const loadoutAtual = lerLoadout();
    const isSeguro = (itemName: string) => (loadoutAtual.itemSeguro === itemName && andarAtual <= 6);

    if (jogador.equippedWeapon.name !== "Espada Quebrada" && !isSeguro(jogador.equippedWeapon.name)) {
      removerItemExtra(jogador.equippedWeapon.name);
    }
    if (jogador.equippedArmor && !armadurasBasicas.includes(jogador.equippedArmor.name) && !isSeguro(jogador.equippedArmor.name)) {
      removerItemExtra(jogador.equippedArmor.name);
    }
    jogador.equippedAccessories.forEach((acc: any) => {
      if (!acessoriosBasicos.includes(acc.name) && !isSeguro(acc.name)) {
        removerItemExtra(acc.name);
      }
    });

    limparArmasExtras();
    limparConsumiveisExtras();
    // Limpa buff da Fúria se o player morrer
    jogador.activeBuffs = jogador.activeBuffs.filter(b => b.name !== "Fúria Descontrolada");
    furiaPenalidade = false;
    furiaPenalidadeAtiva = false;
    jogador.removerEquipamentos();
    atualizarLog(`Você foi derrotado! Você extraiu ${goldGanho}G (Perdeu ${goldPerdido}G) e perdeu seus itens!`);
    playMusic("title");
    return;
  }

  inimigosAtuais = inimigosAtuais.filter(i => i.life > 0);
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  jogador.processarCondicoesInicioTurno();
  if (jogador.life <= 0) {
    menuBatalhaPrincipal(); // Rechama para processar a morte
    return;
  }

  const caido = jogador.condicoes.find(c => c.nome === "Caído");
  if (caido) {
    opcoesAcao = [
      {
        texto: "Levantar (Gasta o turno)", acao: () => {
          atualizarLog("Você gasta seu turno se levantando do chão.", () => {
            jogador.condicoes = jogador.condicoes.filter(c => c.nome !== "Caído");
            setTimeout(() => turnoInimigo(), 800);
          });
        }
      }
    ];
    let avisos = "Você está caído! Você deve se levantar antes de agir.";
    if (furiaPenalidadeAtiva) avisos += " \u26a0️ -15% dano (ressaca da Fúria)";
    atualizarLog(avisos);
    render();
    return;
  }

  const paralisado = jogador.condicoes.find(c => c.nome === "Paralisado");
  if (paralisado) {
    atualizarLog(`Você está paralisado e não pode agir!`, () => {
      setTimeout(() => turnoInimigo(), 800);
    });
    return;
  }

  // Fúria Descontrolada: pula o primeiro turno do jogador no combate penalizado
  if (furiaPenalidadeAtiva && !furiaSkipouPrimeiroTurno) {
    furiaSkipouPrimeiroTurno = true;
    atualizarLog("💢 A exaustão da Fúria Descontrolada te impede de agir no primeiro turno!", () => {
      setTimeout(() => turnoInimigo(), 800);
    });
    return;
  }

  let avisos = "";
  if (furiaPenalidadeAtiva) avisos += " \u26a0️ -15% dano (ressaca da Fúria)";
  if (jogador.activeBuffs.some(b => b.name === "Fúria Descontrolada")) avisos += " 🔥 CRÍTICO GARANTIDO";

  opcoesAcao = [
    { texto: "Atacar", acao: () => escolherAlvoAtaque() },
    { texto: "Habilidades", acao: () => menuHabilidades() },
    { texto: "Inventário", acao: () => menuInventario() }
  ];
  if (avisos) atualizarLog(avisos);
  render();
}

function menuInventario() {
  opcoesAcao = [
    { texto: "Trocar Arma", acao: () => menuTrocarArma() },
    { texto: "Usar Item", acao: () => menuUsarConsumivel() },
    { texto: "Voltar", acao: () => menuBatalhaPrincipal() }
  ];
  render();
}

function menuTrocarArma() {
  if (jogador.weaponInventory.length === 0) {
    atualizarLog("Você não possui outras armas!");
    menuInventario();
    return;
  }

  opcoesAcao = jogador.weaponInventory.map((arma, idx) => ({
    texto: `Equipar ${arma.name} (${arma.damage} Dano)`,
    descricao: getWeaponTooltip(arma).replace('<div class="btn-tooltip">', '').replace('</div>', ''),
    acao: () => {
      jogador.equippedWeapon = arma;
      opcoesAcao = [];
      atualizarLog(`Você equipou a arma ${arma.name}!`, () => {
        setTimeout(() => turnoInimigo(), 500); // Gasta o turno
      });
    }
  }));
  opcoesAcao.push({ texto: "Voltar", acao: () => menuInventario() });
  render();
}

function escolherAlvoParaItem(item: any, itemIdx: number) {
  if (inimigosAtuais.length === 1) {
    usarConsumivelEmAlvo(item, itemIdx, inimigosAtuais[0]!);
  } else {
    opcoesAcao = inimigosAtuais.map((ini) => ({
      texto: `Usar em ${ini.name}`,
      acao: () => usarConsumivelEmAlvo(item, itemIdx, ini)
    }));
    opcoesAcao.push({ texto: "Voltar", acao: () => menuUsarConsumivel() });
    render();
  }
}

function usarConsumivelEmAlvo(item: any, itemIdx: number, alvo: enemy) {
  const hpAntes = jogador.life;
  const buff = item.usar(jogador, alvo);
  const curado = Math.max(0, jogador.life - hpAntes);
  if (curado > 0) runStats.vidaCurada += curado;
  if (buff) jogador.activeBuffs.push(buff);
  jogador.inventory.splice(itemIdx, 1);

  const save = lerSave();
  save.consumiveisExtras = jogador.inventory;
  limparConsumiveisExtras();
  jogador.inventory.forEach(i => adicionarConsumivelExtra(i));

  opcoesAcao = [];
  atualizarLog(`Você usou ${item.name}!`, () => {
    setTimeout(() => turnoInimigo(), 500);
  });
}

function menuUsarConsumivel() {
  if (jogador.inventory.length === 0) {
    atualizarLog("Você não tem itens consumíveis!");
    menuInventario();
    return;
  }

  opcoesAcao = jogador.inventory.map((nomeItem, idx) => {
    const item = listaConsumiveis[nomeItem as keyof typeof listaConsumiveis];
    return {
      texto: `Usar ${item.name}`,
      acao: () => {
        if (item.requiresTarget) {
          escolherAlvoParaItem(item, idx);
          return;
        }
        const hpAntes = jogador.life;
        const buff = item.usar(jogador);
        const curado = jogador.life - hpAntes;
        if (curado > 0) runStats.vidaCurada += curado;
        if (buff) jogador.activeBuffs.push(buff);
        jogador.inventory.splice(idx, 1);

        // Remove from save dynamically so they can't save scum if they flee after using
        const save = lerSave();
        save.consumiveisExtras = jogador.inventory;
        // Need a function in saveData to just overwrite consumiveis, but we can do it later, this is fine
        limparConsumiveisExtras();
        jogador.inventory.forEach(i => adicionarConsumivelExtra(i));

        opcoesAcao = [];
        atualizarLog(`Você usou ${item.name}!`, () => {
          setTimeout(() => turnoInimigo(), 500); // Gasta o turno
        });
      }
    };
  });
  opcoesAcao.push({ texto: "Voltar", acao: () => menuInventario() });
  render();
}


function escolherAlvoAtaque() {
  if (inimigosAtuais.length === 1) {
    atacarInimigo(0);
  } else {
    opcoesAcao = inimigosAtuais.map((ini, idx) => ({
      texto: `Atacar ${ini.name}`,
      acao: () => atacarInimigo(idx)
    }));
    opcoesAcao.push({ texto: "Voltar", acao: () => menuBatalhaPrincipal() });
    render();
  }
}

function atacarInimigo(alvoIdx: number) {
  const alvo = inimigosAtuais[alvoIdx]!;
  let danoBase = jogador.danoComArma();
  const mortosVivos = ["Zumbi", "Esqueleto", "Múmia", "Vampiro", "Necromante", "Ghoul", "Lich", "ArquLich"];
  const temDominioDaMorte = jogador.skills.some(s => s.nome === "Domínio da Morte");
  if (temDominioDaMorte && mortosVivos.includes(alvo.name)) {
    danoBase = Math.floor(danoBase * 1.5);
  }

  // Mata Gigantes
  const temMataGigantes = jogador.skills.some(s => s.nome === "Mata gigantes");
  let bonusMataGigantes = 0;
  if (temMataGigantes && alvo.life > jogador.life) {
    bonusMataGigantes = Math.min(0.45, ((alvo.life - jogador.life) / 500) * 0.45);
    danoBase = Math.floor(danoBase * (1 + bonusMataGigantes));
  }

  // Fúria Descontrolada penalidade: -15% dano
  if (furiaPenalidadeAtiva) danoBase = Math.floor(danoBase * 0.85);

  // Keth: Prontidão (+50% de dano após esquiva)
  const prontidaoIndex = jogador.activeBuffs.findIndex(b => b.name === "Prontidão");
  if (prontidaoIndex !== -1) {
    danoBase = Math.floor(danoBase * 1.5);
    jogador.activeBuffs.splice(prontidaoIndex, 1); // Consome o buff
  }

  // Raio Negro: bônus de crit acumulado (passiva épica)
  const temRaioNegro = jogador.skills.some(s => s.nome === "Raio Negro");
  const critBase = jogador.taxaCritica;
  const critRaioNegro = temRaioNegro ? 0.05 + (raioNegroStack * 0.10) : 0;
  const critTotal = Math.min(0.65, critBase + critRaioNegro);

  // Fúria Descontrolada: crítico garantido neste combate
  const furiaAtivaNow = jogador.activeBuffs.some(b => b.name === "Fúria Descontrolada");
  const isCrit = furiaAtivaNow || Math.random() < critTotal || (jogador.classe === "Assassino" && primeiraSalaCombate && !assassinoCritou);
  let danoFinal = Math.floor(isCrit ? danoBase * 2 : danoBase);
  if (isCrit) {
    triggerScreenShake = true;
  }

  // Atualiza stack do Raio Negro
  if (temRaioNegro) {
    if (isCrit) {
      raioNegroStack = Math.min(raioNegroStack + 1, 6);
    } else {
      raioNegroStack = 0;
    }
  }

  alvo.life -= danoFinal;
  runStats.danoCausado += danoFinal;
  if (isCrit) runStats.acertosCriticos++;
  playSfx("hit");

  const lifesteal = jogador.aplicarRouboDeVida(danoFinal);
  if (lifesteal > 0) runStats.vidaCurada += lifesteal;

  let msg = `Você atacou ${alvo.name} causando ${danoFinal} de dano!`;
  if (lifesteal > 0) msg += ` (Roubou ${lifesteal} vida)`;
  if (furiaAtivaNow && isCrit) msg = `🔥 CRÍTICO (FÚria)! ` + msg;
  else if (isCrit) msg = `⚡ CRÍTICO! ` + msg;
  if (temRaioNegro && isCrit) msg += ` (Raio Negro: ${(critTotal * 100).toFixed(0)}% crit — streak ${raioNegroStack})`;
  if (furiaPenalidadeAtiva) msg += ` [ressaca -15% dano]`;
  if (prontidaoIndex !== -1) msg += ` [Prontidão +50% dano]`;
  if (temDominioDaMorte && mortosVivos.includes(alvo.name)) msg += ` [Domínio da Morte +50% dano]`;
  if (temMataGigantes && bonusMataGigantes > 0) msg += ` [Mata Gigantes +${(bonusMataGigantes * 100).toFixed(1)}% dano]`;

  if (jogador.equippedWeapon.name === "Adaga Venenosa" && alvo.life > 0 && Math.random() <= 0.50) {
    alvo.adicionarCondicao({ nome: "Envenenado", duracao: 3, danoOpcional: 10 });
    msg += ` [Veneno Aplicado!]`;
  }
  if (jogador.equippedWeapon.name === "Martelo de Guerra" && alvo.life > 0 && Math.random() <= 0.15) {
    if (!alvo.jaCaiu) {
      alvo.adicionarCondicao({ nome: "Caído", duracao: 1 });
      msg += ` [Alvo Derrubado!]`;
    }
  }

  if (alvo.life <= 0) {
    msg += ` ${alvo.name} foi derrotado!`;
  }

  opcoesAcao = [];
  atualizarLog(msg, () => {
    setTimeout(() => {
      turnoInimigo();
    }, 500);
  });
}

function menuHabilidades() {
  const ativas = jogador.skills.filter(s => s.tipo === "ATIVA");
  if (ativas.length === 0) {
    atualizarLog("Você não possui habilidades ativas!");
    menuBatalhaPrincipal();
    return;
  }

  opcoesAcao = ativas.map((skill) => {
    const idxReal = jogador.skills.indexOf(skill);
    return {
      texto: `${skill.nome} (${skill.tipo})`,
      descricao: skill.descricao,
      acao: () => usarHabilidade(idxReal)
    };
  });
  opcoesAcao.push({ texto: "Voltar", acao: () => menuBatalhaPrincipal() });
  render();
}

function usarHabilidade(idx: number) {
  const habilidade = jogador.skills[idx]!;

  if (habilidade.nome === "Rajada Mística") {
    let maxRajadas = 1;
    if (jogador.level >= 12) maxRajadas = 4;
    else if (jogador.level >= 8) maxRajadas = 3;
    else if (jogador.level >= 4) maxRajadas = 2;

    const vivos = inimigosAtuais.filter(i => i.life > 0);
    const alvosEscolhidos: enemy[] = [];

    const dispararRajadas = () => {
      // Escalonamento: O prompt diz "escala com inteligência e sorte"
      const bonusInt = Math.floor(jogador.intelligence * 0.25);
      const bonusLuck = Math.floor(jogador.luck * 0.30);
      const danoPorRajada = 20 + bonusInt + bonusLuck;

      const inimigosDiferentes = new Set(alvosEscolhidos);
      const manaRestaurada = (5 + Math.floor(jogador.maxMana * 0.05)) * inimigosDiferentes.size;

      jogador.mana += manaRestaurada;
      if (jogador.mana > jogador.maxMana) jogador.mana = jogador.maxMana;

      let log = `Você disparou ${alvosEscolhidos.length} Rajadas Místicas! (Dano: ${danoPorRajada}/rajada)\n`;
      let totalLS = 0;
      alvosEscolhidos.forEach(a => {
        a.life -= danoPorRajada;
        runStats.danoCausado += danoPorRajada;
        const lifesteal = jogador.aplicarRouboDeVida(danoPorRajada);
        totalLS += lifesteal;
        if (lifesteal > 0) runStats.vidaCurada += lifesteal;
        log += `⚡ Rajada atingiu ${a.name}!\n`;
      });
      log += `Você recuperou ${manaRestaurada} de Mana!`;
      if (totalLS > 0) log += ` (Roubou ${totalLS} vida)`;

      opcoesAcao = [];
      atualizarLog(log, () => {
        setTimeout(() => turnoInimigo(), 1200);
      });
    };

    if (vivos.length === 1) {
      for (let i = 0; i < maxRajadas; i++) alvosEscolhidos.push(vivos[0]!);
      dispararRajadas();
      return;
    } else {
      const escolherProximoAlvo = (rajadaAtual: number) => {
        if (rajadaAtual > maxRajadas) {
          dispararRajadas();
          return;
        }

        const vivosAtuais = inimigosAtuais.filter(i => i.life > 0);
        if (vivosAtuais.length === 0) {
          dispararRajadas();
          return;
        }

        opcoesAcao = vivosAtuais.map((ini) => ({
          texto: `Atacar ${ini.name}`,
          acao: () => {
            alvosEscolhidos.push(ini);
            escolherProximoAlvo(rajadaAtual + 1);
          }
        }));

        atualizarLog(`Rajada Mística: Selecione o alvo para o tiro ${rajadaAtual}/${maxRajadas}:`);
        render();
      };

      escolherProximoAlvo(1);
      return;
    }
  }

  const executar = (alvo: number) => {
    const hpAntes = jogador.life;
    const sucesso = habilidade.usar(jogador, inimigosAtuais, alvo);
    const curado = jogador.life - hpAntes;
    if (curado > 0) runStats.vidaCurada += curado;

    opcoesAcao = [];
    if (sucesso) {
      atualizarLog(`Você usou ${habilidade.nome}!`, () => {
        setTimeout(() => {
          turnoInimigo();
        }, 500);
      });
    } else {
      atualizarLog(`Falha ao usar ${habilidade.nome}. (Falta recursos)`, () => {
        setTimeout(() => {
          menuBatalhaPrincipal();
        }, 500);
      });
    }
  };

  const habilidadesAlvoUnico = ["Golpe Forte", "Drenar Vida", "Cortes Fantasma"];

  if (habilidadesAlvoUnico.includes(habilidade.nome)) {
    const vivos = inimigosAtuais.filter(i => i.life > 0);
    if (vivos.length > 1) {
      opcoesAcao = vivos.map((ini) => {
        const indexReal = inimigosAtuais.indexOf(ini);
        return {
          texto: `Alvo: ${ini.name}`,
          acao: () => executar(indexReal)
        };
      });
      opcoesAcao.push({ texto: "Voltar", acao: () => menuHabilidades() });
      atualizarLog(`Selecione o alvo para ${habilidade.nome}:`);
      render();
      return;
    } else {
      const indexUnico = inimigosAtuais.findIndex(i => i.life > 0);
      executar(indexUnico !== -1 ? indexUnico : 0);
      return;
    }
  }

  // Skills em área ou self-buff (passa 0 como alvo default)
  executar(0);
}


function processarMortes(): boolean {
  let mortos = false;
  const temNecromante = jogador.skills.some(s => s.nome === "Domínio da Morte");

  for (let i = inimigosAtuais.length - 1; i >= 0; i--) {
    const alvo = inimigosAtuais[i]!;
    if (alvo.life <= 0) {
      mortos = true;
      jogador.experience += alvo.xpReward;
      jogador.gold += Math.floor(alvo.goldReward * jogador.goldMultiplier);

      // Drops de materiais
      const drops = rolarDrops(alvo.name, jogador.luck);
      if (drops.length > 0) {
        drops.forEach(d => {
          adicionarDrop(d);
          battleSummary.drops.push(d);
        });
      }

      battleSummary.inimigosDerrotados.push(alvo.name);
      battleSummary.xpGanho += alvo.xpReward;
      battleSummary.ouroGanho += Math.floor(alvo.goldReward * jogador.goldMultiplier);

      // Necromante Revive (20% de chance + INT * 1%)
      if (temNecromante) {
        const chanceRevive = 0.20 + jogador.intelligence * 0.01;
        if (Math.random() < chanceRevive) {
          const revivido = new enemy(`Fantasma de ${alvo.name}`, alvo.attackPower, Math.floor(alvo.maxLife * 0.5));
          aliadosAtuais.push(revivido);
        }
      }

      inimigosAtuais.splice(i, 1);
    }
  }
  return mortos;
}

function turnoInimigo() {
  const teveMorte = processarMortes();
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  // Velocidade Superior (Keth)
  if (teveMorte) {
    const temVelocidadeSuperior = jogador.skills.some(s => s.nome === "Velocidade Superior");
    if (temVelocidadeSuperior) {
      const chance = Math.min(0.35, 0.05 + jogador.dexterity * 0.01);
      if (Math.random() < chance) {
        atualizarLog(`🗡️ Velocidade Superior! Após o abate, você age tão rápido que ganha um turno extra!`, () => {
          setTimeout(() => menuBatalhaPrincipal(), 800);
        });
        return;
      }
    }
  }

  // Processa passivas de turno dos equipamentos
  jogador.processarPassivasDeEquipamento(inimigosAtuais);
  processarMortes();
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  // Sorte de Principiante
  if (primeiroTurnoDoCombate) {
    primeiroTurnoDoCombate = false;
  }

  // Sorte de Principiante
  const skillSorte = jogador.skills.find(s => s.nome === "Sorte de Principiante");
  if (skillSorte) {
    const baseChance = skillSorte.nivel === 1 ? 0.05 : skillSorte.nivel === 2 ? 0.10 : 0.15;
    const chance = Math.min(0.40, baseChance + (jogador.luck * 0.02));
    if (Math.random() < chance) {
      atualizarLog(`🍀 Sorte de Principiante! Você ganha um turno extra!`, () => {
        setTimeout(() => menuBatalhaPrincipal(), 800);
      });
      return;
    }
  }
  // --- FASE ALIADOS ---
  if (aliadosAtuais.length > 0) {
    aliadosAtuais = aliadosAtuais.filter(a => a.life > 0);
    if (aliadosAtuais.length > 0) {
      let logAliados = ``;
      let totalLSAliados = 0;
      aliadosAtuais.forEach(aliado => {
        const alvo = inimigosAtuais[Math.floor(Math.random() * inimigosAtuais.length)]!;
        alvo.life -= aliado.attackPower;
        runStats.danoCausado += aliado.attackPower;
        const lifesteal = jogador.aplicarRouboDeVida(aliado.attackPower);
        totalLSAliados += lifesteal;
        if (lifesteal > 0) runStats.vidaCurada += lifesteal;
        logAliados += `👻 Seu ${aliado.name} ataca ${alvo.name} por ${aliado.attackPower} dano!\n`;
      });
      if (totalLSAliados > 0) logAliados += `(Você roubou ${totalLSAliados} vida)\n`;

      atualizarLog(logAliados.trim(), () => {
        setTimeout(() => faseBardo(), 800);
      });
      return;
    }
  }

  faseBardo();
}

function faseBardo() {
  processarMortes();
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  const temBardo = jogador.skills.some(s => s.nome === "Encanto do Bardo");
  const chanceEncanto = 0.05 + jogador.luck * 0.01;

  if (temBardo && Math.random() < chanceEncanto) {
    const alvoIdx = Math.floor(Math.random() * inimigosAtuais.length);
    const atacante = inimigosAtuais[alvoIdx]!;
    const alvoReal = inimigosAtuais.length > 1 ? inimigosAtuais[(alvoIdx + 1) % inimigosAtuais.length]! : atacante;
    const dano = atacante.attackPower;
    alvoReal.life -= dano;
    runStats.danoCausado += dano;
    const lifesteal = jogador.aplicarRouboDeVida(dano);
    if (lifesteal > 0) runStats.vidaCurada += lifesteal;

    let encantoLog = `🎵 Encanto do Bardo! ${atacante.name} enlouquece e ataca ${alvoReal.name} por ${dano} de dano!`;
    if (lifesteal > 0) encantoLog += ` (Você roubou ${lifesteal} vida)`;
    atualizarLog(encantoLog, () => {
      setTimeout(() => faseAtaqueInimigos(), 800);
    });
    return;
  }

  faseAtaqueInimigos();
}

function faseAtaqueInimigos() {
  processarMortes();
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  // Processar a Nevasca
  const nevasca = jogador.activeBuffs.find(b => b.name === "Nevasca");
  if (nevasca) {
    const turnosPassados = 100 - nevasca.duration + 1;
    const chance = Math.min(0.30, turnosPassados * 0.10);
    const danoNevasca = jogador.calcularDanoSkill(Math.max(1, Math.floor(jogador.intelligence * 0.1) + 10));

    console.log(chalk.bgCyan.white.bold(`❄️ A Nevasca atinge a sala! (Chance de paralisar: ${(chance * 100).toFixed(0)}%)`));
    for (let ini of inimigosAtuais) {
      if (ini.life > 0) {
        ini.life -= danoNevasca;
        let msg = `O ${ini.name} sofreu ${danoNevasca} de dano de gelo.`;
        if (ini.life > 0 && Math.random() < chance) {
          ini.adicionarCondicao({ nome: "Paralisado", duracao: 1 });
          msg += ` E congelou (Paralisado)!`;
        }
        console.log(chalk.cyanBright(msg));
      }
    }
  }

  let totalDano = 0;
  jogador.processarBuffs();

  // Atualiza bônus da janela de Parry (habilidade Velocidade)
  const temVelocidade = jogador.activeBuffs.some(b => b.name === "Velocidade");
  const temLentidao = jogador.condicoes.some(c => c.nome === "Lentidão");
  let parryBonus = temVelocidade ? 20 : 0;
  if (temLentidao) parryBonus -= 25; // Lentidão penaliza a janela de parry
  setParryWindowBonus(parryBonus);

  let critou = false;

  for (let i = inimigosAtuais.length - 1; i >= 0; i--) {
    const ini = inimigosAtuais[i]!;

    // Processa danos por tempo (Queimando, Veneno)
    ini.processarCondicoesInicioTurno();
    if (ini.life <= 0) continue; // Inimigo morreu pro dano da condição (será limpo no processarMortes)

    // Amedrontado (Fuga ou pular turno)
    const amedrontado = ini.condicoes.find(c => c.nome === "Amedrontado");
    if (amedrontado) {
      if (Math.random() <= 0.15) {
        console.log(chalk.gray(`👻 O inimigo ${ini.name} fugiu de medo! Você ganhou a XP e o Ouro!`));
        jogador.experience += ini.xpReward;
        jogador.levelUp();
        jogador.gold += Math.floor(ini.goldReward * jogador.goldMultiplier);

        inimigosFugindo.push(ini);
        inimigosAtuais.splice(i, 1);

        setTimeout(() => {
          const idx = inimigosFugindo.indexOf(ini);
          if (idx !== -1) {
            inimigosFugindo.splice(idx, 1);
            if (estadoAtual === "BATALHA") render();
          }
        }, 2000);

        continue;
      } else {
        console.log(chalk.gray(`😨 O inimigo ${ini.name} está amedrontado demais para atacar.`));
        continue;
      }
    }

    // Paralisado
    if (ini.condicoes.some(c => c.nome === "Paralisado")) {
      console.log(chalk.gray(`⚡ O inimigo ${ini.name} está paralisado e não pode se mover!`));
      continue;
    }

    // Caído
    if (ini.condicoes.some(c => c.nome === "Caído")) {
      console.log(chalk.gray(`O inimigo ${ini.name} gasta seu turno se levantando.`));
      ini.condicoes = ini.condicoes.filter(c => c.nome !== "Caído");
      continue;
    }

    // Envenenado (chance de erro)
    const envenenado = ini.condicoes.find(c => c.nome === "Envenenado");
    if (envenenado) {
      const stacks = envenenado.stacks || 1;
      const missChance = stacks * 0.05;
      if (Math.random() <= missChance) {
        console.log(chalk.greenBright(`🤢 O inimigo ${ini.name} cambaleou devido ao veneno e errou o ataque!`));
        continue;
      }
    }

    // Nova fórmula de redução (logarítmica): máx teórico nunca chega a 100%
    const reducao = jogador.defense / (jogador.defense + 100);
    let dano = Math.floor(ini.attackPower * (1 - reducao));

    // Inimigos têm 5% de chance de critar (1.5x dano)
    if (Math.random() < 0.05) {
      dano = Math.floor(dano * 1.5);
      critou = true;
    }

    if (dano < 1) dano = 1;
    totalDano += dano;
  }

  processarMortes(); // Limpa os inimigos que morreram para danos de condição
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  if (totalDano === 0) {
    // Se nenhum inimigo atacou com sucesso (pularam, fugiram ou erraram)
    atualizarLog("Os inimigos não conseguiram atacar!", () => {
      setTimeout(() => menuBatalhaPrincipal(), 800);
    });
    return;
  }

  if (critou) triggerScreenShake = true;

  opcoesAcao = [];
  render(); // Limpa os botoes antes de mostrar o parry

  showParryBar(
    () => {
      // Parry bem sucedido: sem dano
      runStats.parryAcertos++;
      let parryMsg = `<img src="sprites/weapon-icon.png" style="width:44px; height:44px; vertical-align:-12px;" alt="⚔️"> PARRY PERFEITO! Você bloqueou o ataque dos inimigos!`;

      if (parryStreak === 10 && !temFlag('marco_10_parrys')) {
        desbloquearFlag('marco_10_parrys');
        parryMsg += `<br><br><span style="color:#ffd700">🏆 MARCO DESBLOQUEADO: Mestre do Parry! (+3 Destreza Permanente)</span>`;
      }

      atualizarLog(parryMsg, () => {
        setTimeout(() => menuBatalhaPrincipal(), 500);
      });
    },
    () => {
      // Parry falhou: verifica Evasivo (passiva de esquiva)
      runStats.parryErros++;
      const temEvasivo = jogador.skills.some(s => s.nome === "Evasivo");
      if (temEvasivo) {
        // Chance de esquiva: base 5% + (DEX * 1.75%), teto de 40%
        const chanceEsquiva = Math.min(0.40, 0.05 + jogador.dexterity * 0.0175);
        if (Math.random() < chanceEsquiva) {
          if (jogador.classe === "Keth") {
            jogador.activeBuffs.push({
              name: "Prontidão",
              duration: 1, // Durará até o próximo ataque ou turno expirar
              onExpire: () => { }
            });
          }
          runStats.esquivas++;
          atualizarLog(`💨 Evasivo! Você desviou do ataque por um fio! (${(chanceEsquiva * 100).toFixed(0)}% esquiva)`, () => {
            setTimeout(() => menuBatalhaPrincipal(), 500);
          });
          return;
        }
      }
      // Sem esquiva: aplica passiva Bastião se ativa (Armadura de Placas)
      let danoFinalAoJogador = totalDano;
      if (jogador._armorPassivaAtiva === "Bastião" && jogador.life > jogador.maxLife * 0.5) {
        danoFinalAoJogador = Math.floor(danoFinalAoJogador * 0.90);
      }
      danoFinalAoJogador = Math.floor(danoFinalAoJogador * jogador.danoSofridoMultiplier);
      jogador.life -= danoFinalAoJogador;
      runStats.danoRecebido += danoFinalAoJogador;
      const bastMsg = jogador._armorPassivaAtiva === "Bastião" ? " [Bastião: -10%]" : "";

      let extraLog = "";
      for (const ini of inimigosAtuais) {
        if (ini.life <= 0) continue;
        const c = ini.condicoes;
        if (!c.some(x => x.nome === "Paralisado" || x.nome === "Caído" || x.nome === "Amedrontado")) {
          if (["Dragão", "Dragão Negro", "Serpente de Fogo", "Diabrete"].includes(ini.name) && Math.random() <= 0.25) {
            jogador.adicionarCondicao({ nome: "Queimando", duracao: 2, danoOpcional: 15 });
            extraLog += `<br>🔥 O ${ini.name} deixou você Queimando!`;
          }
          if (["Rainha da Praga", "Centopeia Anciã", "Aranha Gigante", "Verme da Areia"].includes(ini.name) && Math.random() <= 0.30) {
            jogador.adicionarCondicao({ nome: "Envenenado", duracao: 3, danoOpcional: 10 });
            extraLog += `<br>🤢 O ${ini.name} envenenou você!`;
          }
          if (["Medusa", "Banshee"].includes(ini.name) && Math.random() <= 0.15) {
            jogador.adicionarCondicao({ nome: "Paralisado", duracao: 1 });
            extraLog += `<br>⚡ O ${ini.name} paralisou você!`;
          }
          if (["Minotauro", "Titã", "Golem de Pedra"].includes(ini.name) && Math.random() <= 0.20) {
            jogador.adicionarCondicao({ nome: "Caído", duracao: 1 });
            extraLog += `<br>💢 O ${ini.name} te derrubou!`;
          }
          if (["Zumbi", "Múmia", "Lich", "ArquLich", "O Segundo Dedo"].includes(ini.name) && Math.random() <= 0.25) {
            jogador.adicionarCondicao({ nome: "Lentidão", duracao: 2 });
            extraLog += `<br>🐌 O ${ini.name} reduziu seus reflexos (Lentidão)!`;
          }
          if (["O Errante", "Servo das Sombras", "Necromante"].includes(ini.name) && Math.random() <= 0.15) {
            jogador.adicionarCondicao({ nome: "Amedrontado", duracao: 2 });
            extraLog += `<br>😨 O terror do ${ini.name} te amedrontou!`;
          }
        }
      }

      atualizarLog(`Os inimigos atacam e causam ${danoFinalAoJogador} de dano!${bastMsg}${extraLog}`, () => {
        setTimeout(() => menuBatalhaPrincipal(), 500);
      });
    }
  );
}

// --- EVENTOS E ESCOLHA DE SALAS ---

let combateAtualIsElite = false;
let salaEscolhidaDescricao: RoomDescription | null = null;
function gerarOpcoesDeSala() {
  if (salaAtual === 6) {
    estadoAtual = "ESCOLHA_SALA";
    const descBoss = sortearDescricaoSala(expedicaoAtiva, "boss", descricoesUsadasNaRun);
    logMensagem = descBoss ? descBoss.texto : "Uma aura pesada emana da próxima sala... O Boss aguarda!";
    opcoesAcao = [
      {
        texto: "Entrar no Covil do Boss", acao: () => {
          if (descBoss) { descricoesUsadasNaRun.add(descBoss.id); salaEscolhidaDescricao = descBoss; }
          combateAtualIsElite = false; avancarSala();
        }
      }
    ];
    render();
    return;
  }

  if (salaAtual === 7) {
    estadoAtual = "EVENTO_PORTAL";
    logMensagem = "Com o Boss derrotado, um Portal de Extração se abre diante de você, emanando uma energia segura.";
    opcoesAcao = [
      { texto: "Entrar no Portal (Extrair e Vencer)", acao: () => extrairJogador() },
      { texto: "Avançar para o Próximo Andar", acao: () => { combateAtualIsElite = false; avancarSala(); } }
    ];
    render();
    return;
  }

  estadoAtual = "ESCOLHA_SALA";
  logMensagem = "Escolha seu próximo destino:";

  let temFogueira = (salaAtual === 5);
  const opcoesPossiveis = [];

  if (temFogueira) {
    const descFogueira = sortearDescricaoSala(expedicaoAtiva, "fogueira", descricoesUsadasNaRun);
    const textoFogueira = descFogueira ? descFogueira.texto : "Fogueira";
    opcoesPossiveis.push({
      texto: textoFogueira, acao: () => {
        if (descFogueira) descricoesUsadasNaRun.add(descFogueira.id);
        ultimoEventoSala = "FOGUEIRA"; eventoFogueira();
      }
    });

    const descCombate = sortearDescricaoSala(expedicaoAtiva, "combate", descricoesUsadasNaRun);
    const textoCombate = descCombate ? descCombate.texto : "Combate Comum";
    opcoesPossiveis.push({
      texto: textoCombate, acao: () => {
        if (descCombate) { descricoesUsadasNaRun.add(descCombate.id); salaEscolhidaDescricao = descCombate; }
        combateAtualIsElite = false; avancarSala();
      }
    });
  } else {
    const numPortas = Math.random() < 0.3 ? 3 : 2;
    const tipos = ["COMBATE", "ELITE", "FOGUEIRA", "ALTAR", "BAU", "PORTAL"];
    const pesos = [65, 15, 5, 5, 5, 5];

    const selecionados = new Set<string>();
    while (selecionados.size < numPortas) {
      let sum = pesos.reduce((a, b) => a + b, 0);
      let r = Math.random() * sum;
      let acc = 0;
      for (let i = 0; i < tipos.length; i++) {
        acc += pesos[i]!;
        if (r <= acc) {
          const tipoSorteado = tipos[i]!;
          // Só adiciona se não for o mesmo evento consecutivo (exceto combates que podem repetir)
          if (tipoSorteado === ultimoEventoSala && !["COMBATE", "ELITE"].includes(tipoSorteado)) {
            break; // Pula essa tentativa e rola de novo
          }
          selecionados.add(tipoSorteado);
          break;
        }
      }
    }

    selecionados.forEach(tipo => {
      let desc: RoomDescription | null = null;
      let texto = "";
      switch (tipo) {
        case "COMBATE":
          desc = sortearDescricaoSala(expedicaoAtiva, "combate", descricoesUsadasNaRun);
          texto = desc ? desc.texto : "Combate Comum";
          opcoesPossiveis.push({
            texto: texto, acao: () => {
              if (desc) { descricoesUsadasNaRun.add(desc.id); salaEscolhidaDescricao = desc; }
              ultimoEventoSala = "COMBATE"; combateAtualIsElite = false; avancarSala();
            }
          });
          break;
        case "ELITE":
          desc = sortearDescricaoSala(expedicaoAtiva, "elite", descricoesUsadasNaRun) || sortearDescricaoSala(expedicaoAtiva, "combate", descricoesUsadasNaRun);
          texto = desc ? desc.texto : "Combate de Elite";
          opcoesPossiveis.push({
            texto: texto, acao: () => {
              if (desc) { descricoesUsadasNaRun.add(desc.id); salaEscolhidaDescricao = desc; }
              ultimoEventoSala = "ELITE"; combateAtualIsElite = true; avancarSala();
            }
          });
          break;
        case "FOGUEIRA":
          desc = sortearDescricaoSala(expedicaoAtiva, "fogueira", descricoesUsadasNaRun);
          texto = desc ? desc.texto : "Fogueira";
          opcoesPossiveis.push({
            texto: texto, acao: () => {
              if (desc) descricoesUsadasNaRun.add(desc.id);
              ultimoEventoSala = "FOGUEIRA"; eventoFogueira();
            }
          });
          break;
        case "ALTAR":
          desc = sortearDescricaoSala(expedicaoAtiva, "altar", descricoesUsadasNaRun);
          texto = desc ? desc.texto : "Altar Sombrio";
          opcoesPossiveis.push({
            texto: texto, acao: () => {
              if (desc) descricoesUsadasNaRun.add(desc.id);
              ultimoEventoSala = "ALTAR"; eventoAltar();
            }
          });
          break;
        case "BAU":
          desc = sortearDescricaoSala(expedicaoAtiva, "tesouro", descricoesUsadasNaRun);
          texto = desc ? desc.texto : "Sala do Tesouro";
          opcoesPossiveis.push({
            texto: texto, acao: () => {
              if (desc) descricoesUsadasNaRun.add(desc.id);
              ultimoEventoSala = "BAU"; eventoBauRandom();
            }
          });
          break;
        case "PORTAL":
          opcoesPossiveis.push({ texto: "Portal de Extração", acao: () => { ultimoEventoSala = "PORTAL"; eventoPortal(); } });
          break;
      }
    });
  }

  opcoesAcao = opcoesPossiveis;
  render();
}

function eventoFogueira() {
  salaAtual++;
  estadoAtual = "EVENTO_FOGUEIRA";
  logMensagem = "Você encontra uma fogueira acolhedora. Seu calor revigora seu corpo e mente.";
  opcoesAcao = [
    {
      texto: "Descansar (Cura 40% HP/Mana/Energia)", acao: () => {
        jogador.life = Math.min(jogador.maxLife, jogador.life + Math.floor(jogador.maxLife * 0.4));
        jogador.mana = Math.min(jogador.maxMana, jogador.mana + Math.floor(jogador.maxMana * 0.4));
        jogador.energy = Math.min(jogador.maxEnergy, jogador.energy + Math.floor(jogador.maxEnergy * 0.4));
        atualizarLog("Você descansou e recuperou vida, mana e energia.", () => gerarOpcoesDeSala());
      }
    },
    {
      texto: "Meditar (+1 Atributo)", acao: () => {
        jogador.pontosDeAtributo++;
        irParaTelaLevelUp();
      }
    }
  ];
  render();
}

function eventoAltar() {
  salaAtual++;
  estadoAtual = "EVENTO_ALTAR";
  logMensagem = "Um altar sombrio feito de obsidiana pulsa com magia antiga. Um sussurro oferece poder em troca de sacrifício.";

  const pactosGerais = [
    {
      texto: "Pacto de Sangue (-40% Max HP / +5 Atributo)", acao: () => {
        const hpPerdido = Math.max(100, Math.floor(jogador.maxLife * 0.4));
        jogador.maxLife -= hpPerdido;
        if (jogador.life > jogador.maxLife) jogador.life = jogador.maxLife;
        jogador.pontosDeAtributo += 5;
        atualizarLog(`Sua força vital foi drenada (-${hpPerdido} Max HP). O poder flui por suas veias!`, () => irParaTelaLevelUp());
      }
    },
    {
      texto: "Pacto do Caniçal (-50% Max HP / +20% Dano e Roubo de Vida)", acao: () => {
        const hpPerdido = Math.max(100, Math.floor(jogador.maxLife * 0.5));
        jogador.maxLife -= hpPerdido;
        if (jogador.life > jogador.maxLife) jogador.life = jogador.maxLife;
        jogador.lifesteal += 0.20;
        jogador.multDanoArma += 0.20;
        jogador.multDanoSkill += 0.20;
        atualizarLog(`Sua humanidade se esvai (-${hpPerdido} Max HP). Você se sente faminto por sangue!`, () => gerarOpcoesDeSala());
      }
    },
    {
      texto: "Pacto da Ganância (+35% Dano Inimigo / +75% Ouro)", acao: () => {
        jogador.danoSofridoMultiplier += 0.35;
        jogador.goldMultiplier += 0.75;
        atualizarLog("O brilho do ouro te cega para o perigo. Inimigos causarão mais dano, mas você será rico!", () => gerarOpcoesDeSala());
      }
    },
    {
      texto: "Pacto do Eremita (0 Max Mana / +20% Crítico, +3 FOR/DES)", acao: () => {
        jogador.maxMana = 0;
        jogador.mana = 0;
        jogador.strength += 3;
        jogador.dexterity += 3;
        jogador.bonusCritico += 0.20;
        atualizarLog("Sua ligação com a mana foi cortada, mas seu instinto físico foi maximizado.", () => gerarOpcoesDeSala());
      }
    },
    {
      texto: "Pacto do Estudioso (-75% Dano Arma / +30% Dano Habilidade)", acao: () => {
        jogador.multDanoArma -= 0.75;
        jogador.multDanoSkill += 0.30;
        atualizarLog("Você abdica da força bruta em favor do conhecimento arcano.", () => gerarOpcoesDeSala());
      }
    }
  ];

  // Seleciona 2 ou 3 aleatórios
  const pactosEscolhidos = [];
  const copiaPactos = [...pactosGerais];
  const qdt = Math.random() < 0.5 ? 2 : 3;
  for (let i = 0; i < qdt; i++) {
    const idx = Math.floor(Math.random() * copiaPactos.length);
    pactosEscolhidos.push(copiaPactos.splice(idx, 1)[0]);
  }

  opcoesAcao = pactosEscolhidos as typeof opcoesAcao;
  opcoesAcao.push({
    texto: "Ignorar o Altar", acao: () => {
      atualizarLog("Você recusa o chamado das sombras e decide seguir adiante.", () => gerarOpcoesDeSala());
    }
  });
  render();
}

function eventoPortal() {
  salaAtual++;
  estadoAtual = "EVENTO_PORTAL";
  logMensagem = "Um portal brilhante de energia estabilizada está no centro da sala. Ele leva de volta ao lobby.";
  opcoesAcao = [
    { texto: "🌀 Extrair (Salva Ouro e Itens)", acao: () => extrairJogador() },
    { texto: "Ignorar (Continuar Explorando)", acao: () => gerarOpcoesDeSala() }
  ];
  render();
}

function eventoBauRandom() {
  salaAtual++;
  estadoAtual = "EVENTO_RECOMPENSA";
  let tipoBau = "COMUM";
  let r = Math.random();
  if (r < 0.1) tipoBau = "EPICO";
  else if (r < 0.4) tipoBau = "RARO";

  const bau = listaBaus[tipoBau as keyof typeof listaBaus];
  const recompensa = abrirBau(bau, jogador);
  let msgBau = `Você encontrou um ${bau.nome} na sala!\n\n`;
  if (recompensa.tipo === "arma") {
    jogador.weaponInventory.push(recompensa.item);
    msgBau += `<img src="sprites/weapon-icon.png" style="width:44px; height:44px; vertical-align:-12px;" alt="⚔️"> Arma: ${recompensa.item.name} (${recompensa.item.raridade})`;
  } else {
    jogador.inventory.push(recompensa.item.name);
    msgBau += `🧪 Consumível: ${recompensa.item.name}`;
  }

  logMensagem = msgBau;
  opcoesAcao = [
    { texto: "Continuar", acao: () => gerarOpcoesDeSala() }
  ];
  render();
}

function extrairJogador() {
  runStats.resultado = "VITÓRIA";
  estadoAtual = "ESTATISTICAS_RUN";
  opcoesAcao = [{ texto: "Ver Relatório", acao: () => render() }];
  adicionarGold(jogador.gold);
  jogador.removerEquipamentos();
  atualizarLog(`Você escapou com sucesso através do portal! Extraiu ${jogador.gold}G e seus itens para o Lobby.`);
}


function vencerBatalha() {
  aliadosAtuais = []; // Limpa os aliados invocados (não persistem)
  // Fúria Descontrolada: se estava ativa, ativar penalidade pro próximo combate
  const furiaEraAtiva = jogador.activeBuffs.some(b => b.name === "Fúria Descontrolada");
  if (furiaEraAtiva) {
    jogador.activeBuffs = jogador.activeBuffs.filter(b => b.name !== "Fúria Descontrolada");
    furiaPenalidade = true;
  }

  // XP de monstros individuais (enemies.ts) + bônus de sala quadrático
  const xpBonusSala = Math.floor(((andarAtual * andarAtual * 20) + (salaAtual * andarAtual * 5)) * multiplicadorDificuldade);
  const goldSala = Math.floor(((andarAtual * 5) + salaAtual) * multiplicadorDificuldade * jogador.goldMultiplier);
  jogador.experience += xpBonusSala;
  jogador.gold += goldSala;

  // Cascata de level-ups: upa quantos níveis for possível de uma vez
  let nivelUp = 0;
  while (jogador.experience >= jogador.experienceToNextLevel) {
    jogador.levelUp();
    nivelUp++;
  }
  (jogador as any)._pendingLevelUps = nivelUp;

  battleSummary.xpGanho += xpBonusSala;
  battleSummary.ouroGanho += goldSala;

  // BOSS (Sala 10): sempre dá baú
  if (salaAtual === 7) {
    // Check para desbloqueio do Necromante
    // No andar 4 a sala 10 é o Servo das Sombras
    if (andarAtual === 4 && jogador.life >= jogador.maxLife / 2) {
      desbloquearFlag("necromante_unlock");
    }

    const bau = bauDoAndar(andarAtual);
    const recompensa = abrirBau(bau, jogador);
    let msgBau = `${logMensagem}\n\n🏆 Boss derrotado! Você recebeu um ${bau.nome}!\n`;

    if (recompensa.tipo === "arma") {
      jogador.weaponInventory.push(recompensa.item);
      msgBau += `<img src="sprites/weapon-icon.png" style="width:44px; height:44px; vertical-align:-12px;" alt="⚔️"> Arma encontrada: ${recompensa.item.name} (${recompensa.item.raridade})`;
    } else {
      jogador.inventory.push(recompensa.item.name);
      msgBau += `🧪 Consumível encontrado: ${recompensa.item.name}`;
    }

    if (andarAtual >= 10) {
      registrarExpedicaoConcluida(expedicaoAtiva.id);
      if (expedicaoAtiva.id === "ancient_dungeon" && multiplicadorDificuldade === 1.5 && jogador.dexterity >= 20) {
        desbloquearFlag("EXP_1_HARD_DEX_20");
      }
      (jogador as any)._expedicaoConcluidaMsg = `🎉 EXPEDIÇÃO CONCLUÍDA! Você derrotou o Boss Final e recebeu um ${bau.nome}!\n`;
    }

    estadoAtual = "RESUMO_BATALHA";
    opcoesAcao = [
      {
        texto: "Continuar",
        acao: () => processarPosResumoBatalha()
      }
    ];
    render();
    return;
  }

  // SALA COMUM (1–9): chance de drop aleatório
  // Chance de consumível: 25% | Chance de item/arma: escala com o andar (5% no andar 1 até 20% no andar 10)
  const chanceConsumivel = 0.25 * multiplicadorDificuldade;
  const chanceArma = (0.05 + (andarAtual * 0.015)) * multiplicadorDificuldade; // 5% andar 1 → ~20% andar 10
  const roll = Math.random();

  if (roll < chanceArma) {
    // Drop de arma: raridade escala com o andar
    const raridadesPossiveis: Array<"COMUM" | "RARA" | "EPICA"> =
      andarAtual <= 3 ? ["COMUM"] :
        andarAtual <= 6 ? ["COMUM", "RARA"] :
          ["COMUM", "RARA", "EPICA"];
    const raridadeEscolhida = raridadesPossiveis[Math.floor(Math.random() * raridadesPossiveis.length)]!;
    const armasFiltradas = Object.values(listaArmas).filter(
      a => a.raridade === raridadeEscolhida && a.name !== "Espada Quebrada"
    );
    if (armasFiltradas.length > 0) {
      const armaDropada = armasFiltradas[Math.floor(Math.random() * armasFiltradas.length)]!;
      jogador.weaponInventory.push(armaDropada);
      battleSummary.armasEncontradas.push(armaDropada);
    }
  } else if (roll < chanceArma + chanceConsumivel) {
    // Drop de consumível
    const consumiveis = Object.values(listaConsumiveis);
    const consDropado = consumiveis[Math.floor(Math.random() * consumiveis.length)]!;
    jogador.inventory.push(consDropado.name);
    battleSummary.consumiveisEncontrados.push(consDropado);
  }

  estadoAtual = "RESUMO_BATALHA";
  opcoesAcao = [
    {
      texto: "Continuar",
      acao: () => processarPosResumoBatalha()
    }
  ];
  render();
}


function iniciarUpgradeSkills() {
  estadoAtual = "UPGRADE_SKILLS";
  const habilidadesElegiveis = jogador.skills.filter(s => s.nivel < 3);

  if (habilidadesElegiveis.length === 0) {
    const goldBonus = 150 * (andarAtual || 1);
    jogador.gold += goldBonus;
    jogador.pendingSkillUpgrades--;
    logMensagem = `Você não tem habilidades elegíveis para evolução.\nNo lugar, você encontrou <span style="color:#fcc419;">${goldBonus}G</span> perdidos no campo de batalha!`;
    opcoesAcao = [
      { texto: "Continuar", acao: () => processarPosResumoBatalha() }
    ];
    render();
    return;
  }

  const opcoesUpgrade = [...habilidadesElegiveis].sort(() => 0.5 - Math.random()).slice(0, 3);
  
  logMensagem = `<div class="upgrade-cards-container">`;
  opcoesAcao = []; // Vazio pq usamos botões customizados

  let htmlCards = '';
  opcoesUpgrade.forEach((skill, i) => {
    const nextLevel = (skill.nivel + 1) as 2 | 3;
    const descMelhoria = skill.getUpgradeDescricao ? skill.getUpgradeDescricao() : "Atributos aprimorados (WIP)";
    htmlCards += `
      <div class="upgrade-card rarity-${skill.raridade}" id="btn-upgrade-skill-${i}">
        <div class="upgrade-level-badge">Evoluir para v${nextLevel}</div>
        <h3>${skill.nome}</h3>
        <div class="upgrade-desc">${skill.descricao}</div>
        <div class="upgrade-improvements">
          <strong>Melhorias:</strong><br>
          ${descMelhoria}
        </div>
      </div>
    `;
  });
  
  logMensagem += htmlCards + `</div>`;
  (window as any)._opcoesUpgrade = opcoesUpgrade;

  render();

  setTimeout(() => {
    opcoesUpgrade.forEach((skill, i) => {
      const el = document.getElementById(`btn-upgrade-skill-${i}`);
      if (el) {
        el.onclick = () => {
          skill.nivel++;
          jogador.pendingSkillUpgrades--;
          
          let upgradeInfo = "";
          if (skill.tipo === "PASSIVA") {
             upgradeInfo = `\nA passiva agora aplicará seus novos bônus automaticamente.`;
          }

          logMensagem = `<div style="text-align:center;">
            <h2 style="color:#a9e34b;">Evolução Concluída!</h2>
            <p>Você aprimorou a habilidade <strong>${skill.nome}</strong> para a <strong>versão ${skill.nivel}</strong>!</p>
            ${upgradeInfo}
          </div>`;
          
          opcoesAcao = [
            { texto: "Continuar", acao: () => processarPosResumoBatalha() }
          ];
          render();
        };
      }
    });
  }, 0);
}
function processarPosResumoBatalha() {
  if (jogador.pendingSkillUpgrades > 0) {
    iniciarUpgradeSkills();
    return;
  }

  const nivelUp = (jogador as any)._pendingLevelUps || 0;
  const hasLoot = battleSummary.armasEncontradas.length > 0 || battleSummary.consumiveisEncontrados.length > 0 || salaAtual === 7;

  const continuarAcao = () => {
    if (hasLoot) {
      estadoAtual = "EVENTO_RECOMPENSA";
      let msg = "";
      if ((jogador as any)._expedicaoConcluidaMsg) {
        msg += (jogador as any)._expedicaoConcluidaMsg;
      } else if (salaAtual === 7) {
        msg += `🏆 Boss derrotado! Você recebeu um Baú!\n`;
      } else {
        msg += `Você encontrou algo interessante no fim da sala:\n`;
      }

      battleSummary.armasEncontradas.forEach(a => {
        msg += `\n<img src="sprites/weapon-icon.png" style="width:44px; height:44px; vertical-align:-12px;" alt="⚔️"> Arma encontrada: ${a.name} (${a.raridade})`;
      });
      battleSummary.consumiveisEncontrados.forEach(c => {
        msg += `\n🧪 Consumível encontrado: ${c.name}`;
      });

      logMensagem = msg;
      opcoesAcao = [
        { texto: "Continuar", acao: () => fimDaSala() }
      ];
      render();
    } else {
      fimDaSala();
    }
  };

  if (nivelUp > 0) {
    skillsPendenteDeEscolha = nivelUp;
    (jogador as any)._pendingLevelUps = 0;
    (jogador as any)._afterLevelUpAction = continuarAcao;
    irParaTelaLevelUp();
  } else {
    continuarAcao();
  }
}

function fimDaSala() {
  if (salaAtual === 7 && andarAtual >= 10) {
    runStats.resultado = "VITÓRIA";
    estadoAtual = "ESTATISTICAS_RUN";
    adicionarGold(jogador.gold);
    jogador.removerEquipamentos();
    opcoesAcao = [{ texto: "Ver Relatório", acao: () => render() }];
    render();
  } else {
    gerarOpcoesDeSala();
  }
}

let opcoesHabilidadesAtuais: import('./skills').ISkill[] = [];

function irParaTelaLevelUp() {
  estadoAtual = "LEVEL_UP_SCREEN";
  let opcoes: any[] = [];

  if (skillsPendenteDeEscolha > 0) {
    if (opcoesHabilidadesAtuais.length === 0) {
      opcoesHabilidadesAtuais = sortearTresHabilidades(jogador.level, jogador.skills, jogador.classe);
      if (opcoesHabilidadesAtuais.length === 0) {
        skillsPendenteDeEscolha = 0; // fallback se não tiver mais
      }
    }

    opcoesHabilidadesAtuais.forEach(op => {
      opcoes.push({
        texto: `<span style="color: #4dabf7;">[Habilidade]</span> ${op.nome} (${op.raridade})`,
        descricao: op.descricao,
        acao: () => {
          jogador.skills.push(op);
          skillsPendenteDeEscolha--;
          opcoesHabilidadesAtuais = [];
          verificarFimLevelUp();
        }
      });
    });
  }

  if (jogador.pontosDeAtributo > 0) {
    opcoes.push({ texto: `<span style="color: #ffd43b;">[Atributo]</span> Força (+1)`, acao: () => { jogador.strength++; jogador.pontosDeAtributo--; verificarFimLevelUp(); } });
    opcoes.push({ texto: `<span style="color: #ffd43b;">[Atributo]</span> Destreza (+1)`, acao: () => { jogador.dexterity++; jogador.pontosDeAtributo--; verificarFimLevelUp(); } });
    opcoes.push({ texto: `<span style="color: #ffd43b;">[Atributo]</span> Inteligência (+1)`, acao: () => { jogador.intelligence++; jogador.pontosDeAtributo--; verificarFimLevelUp(); } });
    opcoes.push({ texto: `<span style="color: #ffd43b;">[Atributo]</span> Sorte (+1)`, acao: () => { jogador.luck++; jogador.pontosDeAtributo--; verificarFimLevelUp(); } });
    opcoes.push({ texto: `<span style="color: #ffd43b;">[Atributo]</span> Defesa (+1)`, acao: () => { jogador.defense++; jogador.pontosDeAtributo--; verificarFimLevelUp(); } });
  }

  opcoesAcao = opcoes;
  render();
}

function verificarFimLevelUp() {
  if (skillsPendenteDeEscolha <= 0 && jogador.pontosDeAtributo <= 0) {
    if ((jogador as any)._afterLevelUpAction) {
      const action = (jogador as any)._afterLevelUpAction;
      (jogador as any)._afterLevelUpAction = undefined; // clear it
      action();
    } else {
      if (andarAtual >= 10 && salaAtual === 7) {
        runStats.resultado = "VITÓRIA";
        estadoAtual = "ESTATISTICAS_RUN";
        opcoesAcao = [{ texto: "Ver Relatório", acao: () => render() }];
        atualizarLog("🎉 EXPEDIÇÃO CONCLUÍDA! Você finalizou o Andar 10 e sua progressão foi salva.");
      } else {
        gerarOpcoesDeSala();
      }
    }
  } else {
    irParaTelaLevelUp();
  }
}




function initSettings() {
  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettings = document.getElementById("close-settings");

  const musicVolInput = document.getElementById("music-vol") as HTMLInputElement;
  const sfxVolInput = document.getElementById("sfx-vol") as HTMLInputElement;

  if (settingsBtn && settingsModal && closeSettings && musicVolInput && sfxVolInput) {
    settingsBtn.onclick = () => {
      musicVolInput.value = musicVolume.toString();
      sfxVolInput.value = sfxVolume.toString();
      settingsModal.style.display = "flex";
    };

    closeSettings.onclick = () => {
      settingsModal.style.display = "none";
    };

    musicVolInput.oninput = (e) => {
      setMusicVolume(parseFloat((e.target as HTMLInputElement).value));
    };

    sfxVolInput.oninput = (e) => {
      setSfxVolume(parseFloat((e.target as HTMLInputElement).value));
    };
  }
}

async function preloadAssets() {
  const assetsToLoad = [
    "/sprites/Rogue-Text-LevelUp-Icon.gif",
    "/sprites/boss-sprite.png",
    "/ost/xDeviruchi - Decisive Battle.wav",
    "/ost/xDeviruchi - Mysterious Dungeon.wav",
    "/ost/xDeviruchi - Title Theme .wav",
    "/ost/sounds/133008__cosmicd__annulet-of-absorption.wav",
    "/ost/sounds/Menu Selection Click.wav",
    "/ost/sounds/heartbeat_slow_0.wav",
    "/ost/sounds/hit01.wav",
    "/ost/sounds/sd_0.wav"
  ];

  const preloader = document.getElementById("preloader");
  const barFill = document.getElementById("progress-bar-fill");
  const textEl = document.getElementById("preloader-text");

  let loadedCount = 0;

  if (!preloader || !barFill || !textEl) {
    // Falhou em encontrar elementos, inicia logo
    render();
    return;
  }

  const updateProgress = () => {
    loadedCount++;
    const percentage = Math.floor((loadedCount / assetsToLoad.length) * 100);
    barFill.style.width = `${percentage}%`;
    textEl.textContent = `Carregando Recursos... ${percentage}%`;
  };

  const loadAsset = (url: string) => {
    return fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${url}`);
        return res.blob();
      })
      .then(() => updateProgress())
      .catch(err => {
        console.warn("Preload error:", err);
        updateProgress(); // Continua mesmo se der erro num asset
      });
  };

  // Carrega tudo
  await Promise.all(assetsToLoad.map(loadAsset));

  // Esconde o preloader com uma leve pausa para mostrar o 100%
  setTimeout(() => {
    preloader.classList.add("hidden");
    // Espera a animação de opacidade terminar e remove da tela
    setTimeout(() => {
      preloader.style.display = "none";
      render();
    }, 500);
  }, 200);
}

// Inicia
initSettings();
initMusic();
preloadAssets();

