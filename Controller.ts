import { mainCharacter } from "./mainCharacter";
import { enemy, battleEnemies } from "./enemies";
import { listaConsumiveis, listaArmas, abrirBau, bauDoAndar } from "./artefacts";
import { sortearTresHabilidades } from "./actions";
import { getClassesDisponiveis, getClassesBloqueadas, aplicarClasse } from "./classes";
import { lerSave, atualizarAndarMax, adicionarGold, gastarGold, adicionarArmaExtra, limparArmasExtras, adicionarConsumivelExtra, limparConsumiveisExtras } from "./saveData";
import { initMusic, playMusic } from "./music.js";

// Dados Globais
const monstrosPorAndar: { [key: number]: string[] } = {
  1: ["Goblin", "Pequeno Troll", "Cão de Caça", "Morcego Raivoso"],
  2: ["Homúnculo", "Esqueleto", "Zumbi", "Múmia"],
  3: ["Diabrete", "Gárgula", "Armadura Viva"],
  4: ["Lobo Sombrio", "Sacerdote Caído", "Quimera"],
  5: ["Medusa", "Verme da Areia", "Sereia"],
  6: ["Vampiro", "Necromante", "Aranha Gigante"],
  7: ["Troll da Montanha", "Wendigo", "Minotauro"],
  8: ["Golem de Pedra", "Ghoul", "Lich"],
  9: ["Titã", "Banshee", "Demônio Menor"],
  10: ["Abominação", "ArquLich", "Súcubo"],
};

const bossesPorAndar: { [key: number]: string[] } = {
  1: ["Dragão"],
  2: ["Hidra"],
  3: ["Serpente de Fogo"],
  4: ["Servo das Sombras"],
  5: ["Centopeia Anciã"]
};

// Estado da Aplicação
type GameState = "LOBBY" | "LOJA" | "SELECAO_CLASSE" | "EQUIPAMENTO_INICIAL" | "EXPLORACAO" | "BATALHA" | "LEVEL_UP_SKILL" | "ALOCAR_ATRIBUTO" | "GAME_OVER";

let estadoAtual: GameState = "LOBBY";
let jogador: mainCharacter;
let inimigosAtuais: enemy[] = [];
let andarAtual: number = 1;
let salaAtual: number = 0;
let logMensagem: string = "Bem-vindo ao RogueText!";
let opcoesAcao: { texto: string, acao: () => void }[] = [];

// Funções de UI
const app = document.getElementById("game-container")!;

let typeWriterTimeout: any = null;
let isTyping = false;

function atualizarLog(msg: string, onComplete?: () => void) {
  if (typeWriterTimeout) clearTimeout(typeWriterTimeout);
  logMensagem = msg;
  render(); // Initial render to update HUD

  const logEl = document.querySelector('.action-log');
  if (logEl) {
    logEl.textContent = "";
    isTyping = true;
    let i = 0;
    function type() {
      if (i < msg.length) {
        logEl!.textContent += msg.charAt(i);
        i++;
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

function render() {
  app.innerHTML = "";

  if (estadoAtual === "LOBBY") {
    app.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <button class="btn-lobby" id="btn-nova-run">Nova Run</button>
        <button class="btn-lobby" id="btn-loja">Loja</button>
      </div>`;
    document.getElementById("btn-nova-run")!.onclick = () => iniciarNovaRun();
    document.getElementById("btn-loja")!.onclick = () => { estadoAtual = "LOJA"; render(); };
    playMusic("title");
    return;
  }

  if (estadoAtual === "LOJA") {
    const save = lerSave();
    let html = `<h2>Loja (Ouro Global: ${save.gold}G)</h2><div class="action-buttons" style="flex-direction:column; align-items:center;">`;
    const armasAVenda = Object.values(listaArmas).filter(a => a.price > 0);
    const consumiveisAVenda = Object.values(listaConsumiveis).filter(c => true); // Supondo que todos consumiveis tem preço? Espere, consumíveis na loja? Em artefacts.ts os consumiveis tem price?
    // Precisarei verificar se consumíveis tem preço. Se não, preciso adicionar na interface.
    // Vamos apenas exibir armas por enquanto na UI principal, e depois eu corrijo os consumíveis no artefacts.ts.
    
    html += `<h3>Armas</h3><div class="action-buttons" style="flex-direction:column; align-items:center;">`;
    armasAVenda.forEach((arma, idx) => {
      const comprado = save.armasExtras.includes(arma.name);
      if (comprado) {
         html += `<button class="btn-action" disabled>${arma.name} - Comprado</button>`;
      } else {
         html += `<button class="btn-action" id="btn-comprar-arma-${idx}">${arma.name} - ${arma.price}G</button>`;
      }
    });
    html += `</div>`;
    
    // Consumíveis
    html += `<h3>Consumíveis</h3><div class="action-buttons" style="flex-direction:column; align-items:center;">`;
    Object.values(listaConsumiveis).forEach((cons, idx) => {
         const preco = (cons as any).price || 30; 
         const qtd = save.consumiveisExtras.filter(nome => nome === cons.name).length;
         const txtQtd = qtd > 0 ? ` (${qtd}x)` : "";
         html += `<button class="btn-action" id="btn-comprar-cons-${idx}">${cons.name}${txtQtd} - ${preco}G</button>`;
    });
    html += `</div>`;
    
    html += `<button class="btn-action" style="margin-top:20px;" id="btn-loja-voltar">Voltar</button>`;
    html += `</div>`;
    app.innerHTML = html;

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

    document.getElementById("btn-loja-voltar")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    return;
  }

  if (estadoAtual === "SELECAO_CLASSE") {
    const save = lerSave();
    const disponiveis = getClassesDisponiveis(save.andarMaxAlcancado);
    const bloqueadas = getClassesBloqueadas(save.andarMaxAlcancado);

    let html = `<h2>Selecione sua Classe</h2><div class="action-buttons">`;
    disponiveis.forEach((classe, idx) => {
      html += `<button class="btn-action" id="btn-classe-${idx}">
        <span class="key-hint">[${idx + 1}]</span> ${classe.nome}<br>
        <small class="text-gray">${classe.descricao}</small>
      </button>`;
    });
    html += `</div>`;

    if (bloqueadas.length > 0) {
      html += `<h3 style="margin-top:20px; color:#555;">Classes Bloqueadas</h3><div style="text-align:left; color:#555;">`;
      bloqueadas.forEach(c => {
        html += `<p>🔒 ${c.nome} - Chegue ao Andar ${c.andarDesbloqueio}</p>`;
      });
      html += `</div>`;
    }

    app.innerHTML = html;

    disponiveis.forEach((classe, idx) => {
      document.getElementById(`btn-classe-${idx}`)!.onclick = () => {
        aplicarClasse(jogador, classe);
        estadoAtual = "EQUIPAMENTO_INICIAL";
        render();
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

  if (estadoAtual === "EQUIPAMENTO_INICIAL") {
    let html = `<h2>Escolha sua Arma Inicial</h2><div class="action-buttons" style="flex-direction:column; align-items:center;">`;
    
    jogador.weaponInventory.forEach((arma, idx) => {
      html += `<button class="btn-action" id="btn-eq-ini-${idx}">
        <span class="key-hint">[${idx + 1}]</span> Equipar ${arma.name} (${arma.damage} Dano)
      </button>`;
    });
    html += `</div>`;
    app.innerHTML = html;

    jogador.weaponInventory.forEach((arma, idx) => {
      document.getElementById(`btn-eq-ini-${idx}`)!.onclick = () => {
        jogador.equippedWeapon = arma;
        estadoAtual = "EXPLORACAO";
        opcoesAcao = [{ texto: "Iniciar Jornada", acao: () => avancarSala() }];
        atualizarLog(`Você escolheu a classe ${jogador.classe} e equipou ${arma.name}! Boa sorte!`);
      };
    });

    window.onkeydown = (e) => {
      const num = parseInt(e.key) - 1;
      if (num >= 0 && num < jogador.weaponInventory.length) {
        document.getElementById(`btn-eq-ini-${num}`)?.click();
      }
    };
    return;
  }

  // HUD (Exploração, Batalha, Level Up)
  let htmlHUD = `
    <div class="hud-container">
      <div class="hud-row">
        <span class="hud-title">${jogador.name} ${jogador.classe ? `[${jogador.classe}]` : ""} - Nv. ${jogador.level}</span>
        <span class="text-yellow">XP: ${jogador.experience}/${jogador.experienceToNextLevel} | Ouro: ${jogador.gold}G | Andar ${andarAtual} (Sala ${salaAtual})</span>
      </div>
      
      <div class="hud-row" style="gap: 15px;">
        <div class="bar-container">
          <div class="bar-fill bg-red" style="width: ${Math.max(0, (jogador.life / jogador.maxLife) * 100)}%"></div>
          <div class="bar-text">❤️ ${Math.max(0, Math.floor(jogador.life))}/${jogador.maxLife}</div>
        </div>
        <div class="bar-container">
          <div class="bar-fill bg-blue" style="width: ${Math.max(0, (jogador.mana / jogador.maxMana) * 100)}%"></div>
          <div class="bar-text">💧 ${Math.max(0, Math.floor(jogador.mana))}/${jogador.maxMana}</div>
        </div>
        <div class="bar-container">
          <div class="bar-fill bg-yellow" style="width: ${Math.max(0, (jogador.energy / jogador.maxEnergy) * 100)}%"></div>
          <div class="bar-text">⚡ ${Math.max(0, Math.floor(jogador.energy))}/${jogador.maxEnergy}</div>
        </div>
      </div>

      <div class="stats-grid" style="margin-top:10px;">
        <span class="text-red">STR: ${jogador.strength}</span>
        <span class="text-magenta">DEX: ${jogador.dexterity}</span>
        <span class="text-blue">INT: ${jogador.intelligence}</span>
        <span class="text-yellow">LUCK: ${jogador.luck}</span>
        <span class="text-cyan">DEF: ${jogador.defense}</span>
      </div>
      <div class="stats-grid" style="margin-top:5px;">
        <span class="text-gray">Arma: ${jogador.equippedWeapon?.name || "Nenhuma"} (${jogador.danoComArma()} Dano)</span>
        <span class="text-gray">Crítico: ${(jogador.taxaCritica * 100).toFixed(0)}%</span>
      </div>
    </div>
  `;

  if (estadoAtual === "BATALHA") {
    htmlHUD += `<div class="hud-container" style="border-color: #c92a2a;">`;
    inimigosAtuais.forEach((ini, idx) => {
      const vidaAtual = Math.max(0, Math.floor(ini.life));
      const porcentagemVida = Math.max(0, (ini.life / ini.maxLife) * 100);
      htmlHUD += `
        <div class="hud-row">
          <span class="text-red">[${idx + 1}] ${ini.name}</span>
        </div>
        <div class="bar-container" style="margin-bottom: 10px;">
          <div class="bar-fill bg-red" style="width: ${porcentagemVida}%"></div>
          <div class="bar-text">${vidaAtual}/${ini.maxLife}</div>
        </div>
      `;
    });
    htmlHUD += `</div>`;
  }

  // Log de Ação
  htmlHUD += `<div class="action-log">${logMensagem}</div>`;

  // Botões de Ação
  htmlHUD += `<div class="action-buttons">`;
  opcoesAcao.forEach((opcao, idx) => {
    htmlHUD += `<button class="btn-action" id="btn-acao-${idx}">
      <span class="key-hint">[${idx + 1}]</span> ${opcao.texto}
    </button>`;
  });
  htmlHUD += `</div>`;

  app.innerHTML = htmlHUD;

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
  jogador = new mainCharacter("Herói", 15, 100, 100, 100, 0, 0, 0, 0, 0);
  const save = lerSave();
  save.armasExtras.forEach(armaName => {
    const arma = listaArmas[armaName];
    if (arma) jogador.weaponInventory.push(arma);
  });
  save.consumiveisExtras.forEach(consName => {
    jogador.inventory.push(consName);
  });
  andarAtual = 1;
  salaAtual = 0;
  estadoAtual = "SELECAO_CLASSE";
  render();
}

function avancarSala() {
  if (salaAtual === 10) {
    salaAtual = 0;
    andarAtual++;
    atualizarAndarMax(andarAtual);
    atualizarLog(`Você avançou para o andar ${andarAtual}!`);
  } else {
    salaAtual++;
    atualizarLog(`Você avançou para a sala ${salaAtual} do andar ${andarAtual}.`);
  }
  gerarInimigos();
}

function gerarInimigos() {
  inimigosAtuais = [];
  if (salaAtual === 10) {
    playMusic("boss");
    const lista = bossesPorAndar[andarAtual];
    if (lista) {
      const bossName = lista[Math.floor(Math.random() * lista.length)]!;
      const bossObj = battleEnemies[bossName as keyof typeof battleEnemies];
      inimigosAtuais.push(new enemy(bossName, bossObj.attackPower, bossObj.life));
    }
  } else {
    playMusic("dungeon");
    const qtd = Math.floor(Math.random() * 3) + 1;
    const lista = monstrosPorAndar[andarAtual];
    if (lista) {
      for (let i = 0; i < qtd; i++) {
        const monstro = lista[Math.floor(Math.random() * lista.length)]!;
        const obj = battleEnemies[monstro as keyof typeof battleEnemies];
        inimigosAtuais.push(new enemy(monstro, obj.attackPower, obj.life));
      }
    }
  }
  estadoAtual = "BATALHA";
  menuBatalhaPrincipal();
}

function menuBatalhaPrincipal() {
  if (jogador.life <= 0) {
    estadoAtual = "GAME_OVER";
    opcoesAcao = [{ texto: "Voltar ao Lobby", acao: () => { estadoAtual = "LOBBY"; render(); } }];
    const goldPerdido = Math.floor(jogador.gold / 2);
    const goldGanho = jogador.gold - goldPerdido;
    adicionarGold(goldGanho);
    limparArmasExtras();
    limparConsumiveisExtras();
    atualizarLog(`Você foi derrotado! Você extraiu ${goldGanho}G (Perdeu ${goldPerdido}G) e perdeu seus itens!`);
    playMusic("title");
    return;
  }

  inimigosAtuais = inimigosAtuais.filter(i => i.life > 0);
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  opcoesAcao = [
    { texto: "Atacar", acao: () => escolherAlvoAtaque() },
    { texto: "Habilidades", acao: () => menuHabilidades() },
    { texto: "Inventário", acao: () => menuInventario() },
    { texto: "Fugir", acao: () => confirmarFuga() }
  ];
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
        const buff = item.usar(jogador);
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

function confirmarFuga() {
  opcoesAcao = [
    { texto: "Tem Certeza?", acao: () => tentarFugir() },
    { texto: "Continuar", acao: () => menuBatalhaPrincipal() }
  ];
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
  const danoBase = jogador.danoComArma();
  const isCrit = Math.random() < jogador.taxaCritica;
  const danoFinal = Math.floor(isCrit ? danoBase * 2 : danoBase);

  alvo.life -= danoFinal;
  
  let msg = `Você atacou ${alvo.name} causando ${danoFinal} de dano!`;
  if (isCrit) msg = `⚡ CRÍTICO! ` + msg;
  
  if (alvo.life <= 0) {
    msg += ` ${alvo.name} foi derrotado (+${alvo.goldReward}G)!`;
    jogador.experience += alvo.xpReward;
    jogador.gold += alvo.goldReward;
  }
  
  opcoesAcao = [];
  atualizarLog(msg, () => {
    setTimeout(() => {
      turnoInimigo();
    }, 500);
  });
}

function menuHabilidades() {
  if (jogador.skills.length === 0) {
    atualizarLog("Você não possui habilidades!");
    menuBatalhaPrincipal();
    return;
  }

  opcoesAcao = jogador.skills.map((skill, idx) => ({
    texto: `${skill.nome} (${skill.tipo})`,
    acao: () => usarHabilidade(idx)
  }));
  opcoesAcao.push({ texto: "Voltar", acao: () => menuBatalhaPrincipal() });
  render();
}

function usarHabilidade(idx: number) {
  // Simplificando o alvo da habilidade para o primeiro inimigo vivo por enquanto na web
  const habilidade = jogador.skills[idx]!;
  // A interface de usar espera console.logs, precisaremos capturar ou ignorar por enquanto
  // e apenas mostrar que a habilidade foi usada.
  const sucesso = habilidade.usar(jogador, inimigosAtuais, 0);
  
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
}

function tentarFugir() {
  opcoesAcao = [];
  if (Math.random() < 0.6) {
    estadoAtual = "GAME_OVER";
    opcoesAcao = [{ texto: "Voltar ao Lobby", acao: () => { estadoAtual = "LOBBY"; render(); } }];
    adicionarGold(jogador.gold);
    atualizarLog(`Você fugiu com sucesso! Extraiu ${jogador.gold}G e todos os seus itens para o Lobby.`);
  } else {
    atualizarLog("Você falhou em fugir!", () => {
      setTimeout(() => {
        turnoInimigo();
      }, 500);
    });
  }
}

function turnoInimigo() {
  inimigosAtuais = inimigosAtuais.filter(i => i.life > 0);
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  let totalDano = 0;
  jogador.processarBuffs();
  
  inimigosAtuais.forEach(ini => {
    const reducao = Math.min(jogador.defense * 0.005, 0.8);
    let dano = Math.floor(ini.attackPower * (1 - reducao));
    if (dano < 1) dano = 1;
    totalDano += dano;
  });

  jogador.life -= totalDano;
  opcoesAcao = [];
  atualizarLog(`Os inimigos atacam e causam ${totalDano} de dano!`, () => {
    setTimeout(() => {
      menuBatalhaPrincipal();
    }, 500);
  });
}

function vencerBatalha() {
  const xpGanho = 20 * (andarAtual ** andarAtual) + (salaAtual * salaAtual) * 10;
  const goldSala = (andarAtual * 5) + salaAtual;
  jogador.experience += xpGanho;
  jogador.gold += goldSala;
  
  if (jogador.experience >= jogador.experienceToNextLevel) {
    jogador.levelUp(); // Trata xp, vida, mana e ganha +1 pontoAtributo
    estadoAtual = "LEVEL_UP_SKILL";
    escolherNovaSkillLevelUp();
    return;
  }

  estadoAtual = "EXPLORACAO";
  opcoesAcao = [{ texto: "Avançar para próxima sala", acao: () => avancarSala() }];
  atualizarLog(`Batalha vencida! Você ganhou ${xpGanho} XP e ${goldSala}G.`);
}

function escolherNovaSkillLevelUp() {
  const opcoes = sortearTresHabilidades(jogador.level, jogador.skills);
  if (opcoes.length === 0) {
    atualizarLog("Você já tem todas as habilidades disponíveis!");
    irParaAlocacaoDeAtributo();
    return;
  }

  atualizarLog("LEVEL UP! Escolha uma nova habilidade:");
  opcoesAcao = opcoes.map(op => ({
    texto: `${op.nome} (${op.raridade})`,
    acao: () => {
      jogador.skills.push(op);
      irParaAlocacaoDeAtributo();
    }
  }));
  render();
}

function irParaAlocacaoDeAtributo() {
  estadoAtual = "ALOCAR_ATRIBUTO";
  if (jogador.pontosDeAtributo <= 0) {
    estadoAtual = "EXPLORACAO";
    opcoesAcao = [{ texto: "Avançar para próxima sala", acao: () => avancarSala() }];
    atualizarLog("Você subiu de nível!");
    return;
  }

  atualizarLog(`ALOCAR ATRIBUTO (${jogador.pontosDeAtributo} restantes)`);
  opcoesAcao = [
    { texto: `Força (+1)`, acao: () => { jogador.strength++; alocouPonto(); } },
    { texto: `Destreza (+1)`, acao: () => { jogador.dexterity++; alocouPonto(); } },
    { texto: `Inteligência (+1)`, acao: () => { jogador.intelligence++; alocouPonto(); } },
    { texto: `Sorte (+1)`, acao: () => { jogador.luck++; alocouPonto(); } },
    { texto: `Defesa (+1)`, acao: () => { jogador.defense++; alocouPonto(); } }
  ];
  render();
}

function alocouPonto() {
  jogador.pontosDeAtributo--;
  irParaAlocacaoDeAtributo(); // Verifica se tem mais ou volta pra exploração
}

// Inicia
initMusic();
render();
