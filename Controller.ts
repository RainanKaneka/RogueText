import { mainCharacter } from "./mainCharacter";
import { enemy, battleEnemies } from "./enemies";
import { listaConsumiveis, listaArmas, listaArmaduras, listaAcessorios, abrirBau, bauDoAndar } from "./artefacts";
import { sortearTresHabilidades } from "./actions";
import { getClassesDisponiveis, getClassesBloqueadas, aplicarClasse } from "./classes";
import { lerSave, salvarSave, atualizarAndarMax, adicionarGold, gastarGold, adicionarArmaExtra, limparArmasExtras, adicionarConsumivelExtra, limparConsumiveisExtras, desbloquearFlag, adicionarDrop, lerDrops, salvarLoadout, lerLoadout, removerItemExtra, consumirDrops, adicionarArmaduraExtra, adicionarAcessorioExtra } from "./saveData";
import { rolarDrops } from "./drops.js";
import { initMusic, playMusic, playSfx, updateHeartbeat, setMusicVolume, setSfxVolume, musicVolume, sfxVolume } from "./music.js";
import { showParryBar, setParryWindowBonus } from "./parry.js";

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
type GameState = "LOBBY" | "LOJA" | "FERREIRO" | "CLASSES" | "SELECAO_CLASSE" | "SELECAO_LOADOUT" | "EXPLORACAO" | "BATALHA" | "LEVEL_UP_SKILL" | "ALOCAR_ATRIBUTO" | "GAME_OVER" | "SOBRE" | "MOCHILA";

let estadoAtual: GameState = "LOBBY";
let jogador: mainCharacter;
let inimigosAtuais: enemy[] = [];
let aliadosAtuais: enemy[] = [];
let andarAtual: number = 1;
let salaAtual: number = 0;
let logMensagem: string = "Bem-vindo ao RogueText!";
let opcoesAcao: { texto: string, acao: () => void, descricao?: string }[] = [];
let lojaAba: "comprar" | "vender" = "comprar";
let itemParaConfirmarVenda: { tipo: "arma" | "consumivel"; nome: string; raridade: string; preco: number } | null = null;
let raioNegroStack: number = 0; // Stack dinâmico de crit da passiva Raio Negro
let furiaPenalidade: boolean = false;    // Próximo combate terá penalidade
let furiaPenalidadeAtiva: boolean = false; // Penalidade ativa no combate atual
let furiaSkipouPrimeiroTurno: boolean = false; // Já pulou o 1º turno deste combate

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

  if (typeof jogador !== "undefined" && jogador) {
    updateHeartbeat(jogador.life / jogador.maxLife);
  } else {
    updateHeartbeat(1); // turn off if not initialized
  }

  if (estadoAtual === "LOBBY") {
    app.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <button class="btn-lobby" id="btn-nova-run">Nova Run</button>
        <button class="btn-lobby" id="btn-loja">Loja</button>
        <button class="btn-lobby" id="btn-ferreiro">Ferreiro</button>
        <button class="btn-lobby" id="btn-mochila">Mochila</button>
        <button class="btn-lobby" id="btn-classes">Classes</button>
        <button class="btn-lobby" id="btn-sobre">Sobre o Jogo</button>
      </div>`;
    document.getElementById("btn-nova-run")!.onclick = () => iniciarNovaRun();
    document.getElementById("btn-classes")!.onclick = () => { estadoAtual = "CLASSES"; render(); };
    document.getElementById("btn-loja")!.onclick = () => { estadoAtual = "LOJA"; render(); };
    document.getElementById("btn-ferreiro")!.onclick = () => { estadoAtual = "FERREIRO"; render(); };
    document.getElementById("btn-sobre")!.onclick = () => { estadoAtual = "SOBRE"; render(); };
    document.getElementById("btn-mochila")!.onclick = () => { estadoAtual = "MOCHILA"; render(); };

    document.querySelectorAll(".btn-lobby").forEach(btn => {
      btn.addEventListener("mouseenter", () => playSfx("hover"));
    });

    playMusic("title");
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
          html += `<button class="btn-action" disabled>${arma.name} — Comprado</button>`;
        } else {
          html += `<button class="btn-action" id="btn-comprar-arma-${idx}">${arma.name} (${arma.raridade}) — ${arma.price}G</button>`;
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
            html += `<button class="btn-action" disabled style="opacity:0.5;">${arma.name} (${arma.raridade}) — Equipada</button>`;
          } else {
            html += `<button class="btn-action" id="btn-vender-arma-${idx}" style="border-color:#c92a2a;">${arma.name} (${arma.raridade}) — Vender por ${precoVenda}G</button>`;
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

    function cardItem(nome: string, sub: string, rar: string) {
      const cor = rarColor[rar] ?? "#aaa";
      return `
        <div style="background:rgba(255,255,255,0.05); border:1px solid #444; border-radius:6px; padding:8px 12px;">
          <div style="color:${cor}; font-weight:bold; font-size:0.9rem;">${nome}</div>
          <div style="color:#888; font-size:0.8rem; margin-top:2px;">${sub}</div>
        </div>`;
    }

    const armasHTML = todasArmas.length > 0
      ? todasArmas.map(a => cardItem(a!.name, `${a!.damage} dano base | ${a!.raridade}`, a!.raridade)).join("")
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
          <h3 style="color:${cor}; margin:0 0 10px 0; font-size:1.1rem; border-bottom:1px solid #333; padding-bottom:6px;">${icone} ${titulo}</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">${conteudo}</div>
        </div>`;
    }

    app.innerHTML = `
      <div class="hud-container" style="text-align:left; max-width:800px; margin:0 auto; color:#ddd;">
        <h2 class="hud-title" style="text-align:center; font-size:2rem; margin-bottom:4px;">Mochila</h2>
        <p style="text-align:center; color:#666; font-size:0.85rem; margin-bottom:20px;">Todos os seus itens e materiais.</p>

        ${secao("Armas", "", "#ffd43b", armasHTML)}
        ${secao("Armaduras", "", "#74c0fc", armadurasHTML)}
        ${secao("Acessórios", "", "#a9e34b", acessoriosHTML)}
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
        
        <h3 style="color:#74c0fc; margin-top: 20px;">🛡️ Armaduras</h3>
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
        <h3 style="color:#a9e34b; margin-top: 20px;">💍 Acessórios</h3>
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

  if (estadoAtual === "SELECAO_CLASSE") {
    const save = lerSave();
    const disponiveis = getClassesDisponiveis(save);
    const bloqueadas = getClassesBloqueadas(save);

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
        estadoAtual = "EXPLORACAO";
        opcoesAcao = [{ texto: "Iniciar Jornada", acao: () => avancarSala() }];
        atualizarLog(`Você escolheu a classe ${jogador.classe}! Boa sorte!`);
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

    let selectedArma = loadoutAtual.arma;
    let selectedArmadura = loadoutAtual.armadura;
    let selectedAcessorio = loadoutAtual.acessorio;

    const rarColor: Record<string, string> = {
      COMUM: "#aaa", RARA: "#4dabf7", EPICA: "#cc5de8", LENDARIA: "#ffd43b", UNICA: "#ff6b6b"
    };

    function renderLoadout() {
      let html = `
        <div style="max-width:750px; margin:0 auto; display:flex; flex-direction:column; gap:20px;">
          <h2 style="text-align:center; margin:0;">⚔️ Configurar Loadout</h2>
          <p style="text-align:center; color:#888; margin:0;">Escolha seu equipamento antes de entrar na masmorra.</p>

          <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px;">
            <!-- ARMAS -->
            <div>
              <h3 style="color:#ffd43b; margin:0 0 8px 0;">⚔️ Arma</h3>
              ${armasDisponiveis.map(a => `
                <button id="lb-arma-${a.name.replace(/\s/g, '_')}" class="btn-action"
                  style="width:100%; margin-bottom:5px; ${selectedArma === a.name ? 'border-color:#ffd43b; background:rgba(255,212,59,0.15);' : ''}">
                  <span style="color:${rarColor[a.raridade] ?? '#aaa'};">${a.name}</span><br>
                  <small>${a.damage} base | ${a.raridade}</small>
                </button>`).join('')}
            </div>
            <!-- ARMADURAS -->
            <div>
              <h3 style="color:#74c0fc; margin:0 0 8px 0;">🛡️ Armadura</h3>
              ${armadurasDisponiveis.map(a => `
                <button id="lb-arm-${a.name.replace(/\s/g, '_')}" class="btn-action"
                  style="width:100%; margin-bottom:5px; ${selectedArmadura === a.name ? 'border-color:#74c0fc; background:rgba(116,192,252,0.15);' : ''}">
                  <span style="color:${rarColor[a.raridade] ?? '#aaa'};">${a.name}</span><br>
                  <small>+${a.bonusVida}HP +${a.bonusDefesa}DEF${a.passiva ? ` | ${a.passiva.nome}` : ''}</small>
                </button>`).join('')}
            </div>
            <!-- ACESSORIOS -->
            <div>
              <h3 style="color:#a9e34b; margin:0 0 8px 0;">💍 Acessório</h3>
              ${acessoriosDisponiveis.map(a => `
                <button id="lb-acc-${a.name.replace(/\s/g, '_')}" class="btn-action"
                  style="width:100%; margin-bottom:5px; ${selectedAcessorio === a.name ? 'border-color:#a9e34b; background:rgba(169,227,75,0.15);' : ''}">
                  <span style="color:${rarColor[a.raridade] ?? '#aaa'};">${a.name}</span><br>
                  <small>${a.bonusStats ? Object.entries(a.bonusStats).map(([k, v]) => `+${v} ${k}`).join(' ') : (a.passiva?.nome ?? 'Sem bônus')}</small>
                </button>`).join('')}
            </div>
          </div>

          <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
            <button class="btn-lobby" id="lb-confirmar" style="padding:12px 40px; font-size:1.1rem;">✅ Confirmar e Continuar</button>
            <button class="btn-lobby" id="lb-voltar" style="padding:12px 20px;">← Voltar ao Lobby</button>
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
      acessoriosDisponiveis.forEach(a => {
        document.getElementById(`lb-acc-${a.name.replace(/\s/g, '_')}`)!.onclick = () => { selectedAcessorio = a.name; renderLoadout(); };
      });

      document.getElementById("lb-confirmar")!.onclick = () => {
        salvarLoadout({ arma: selectedArma, armadura: selectedArmadura, acessorio: selectedAcessorio });
        aplicarLoadoutAoJogador();
        estadoAtual = "SELECAO_CLASSE";
        render();
      };
      document.getElementById("lb-voltar")!.onclick = () => { estadoAtual = "LOBBY"; render(); };
    }
    renderLoadout();
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
      <div class="stats-grid" style="margin-top:4px;">
        <span style="color:#74c0fc;">🛡️ ${jogador.equippedArmor?.name || "Sem Armadura"}</span>
        <span style="color:#a9e34b;">💍 ${jogador.equippedAccessory?.name || "Sem Acessório"}</span>
      </div>
      ${jogador.skills.filter(s => s.tipo === "PASSIVA").length > 0 ? `
      <div style="margin-top:8px; padding-top:6px; border-top: 1px solid #333;">
        <span style="color:#888; font-size:0.85rem;">Passivas: </span>
        ${jogador.skills.filter(s => s.tipo === "PASSIVA").map(s => {
    const cor = s.raridade === "EPICA" ? "#cc5de8" : s.raridade === "LENDARIA" ? "#fcc419" : s.raridade === "RARA" ? "#339af0" : "#aaa";
    return `<span style="color:${cor}; font-size:0.85rem; margin-right:10px;" title="${s.descricao}">✨ ${s.nome}</span>`;
  }).join("")}
      </div>` : ""}
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

    if (aliadosAtuais.length > 0) {
      htmlHUD += `<div class="hud-container" style="border-color: #9c36b5; margin-top: 10px;">`;
      htmlHUD += `<h4 style="color: #9c36b5; margin: 0 0 5px 0;">Seus Aliados (Mortos-Vivos)</h4>`;
      aliadosAtuais.forEach((aliado, idx) => {
        const vidaAtual = Math.max(0, Math.floor(aliado.life));
        const porcentagemVida = Math.max(0, (aliado.life / aliado.maxLife) * 100);
        htmlHUD += `
          <div class="hud-row">
            <span style="color: #9c36b5;">[Aliado] ${aliado.name} (Dano: ${aliado.attackPower})</span>
          </div>
          <div class="bar-container" style="margin-bottom: 5px;">
            <div class="bar-fill" style="background-color: #9c36b5; width: ${porcentagemVida}%"></div>
            <div class="bar-text">${vidaAtual}/${aliado.maxLife}</div>
          </div>
        `;
      });
      htmlHUD += `</div>`;
    }
  }

  // Log de Ação
  htmlHUD += `<div class="action-log">${logMensagem}</div>`;

  // Botões de Ação
  htmlHUD += `<div class="action-buttons">`;
  opcoesAcao.forEach((opcao, idx) => {
    htmlHUD += `<div class="btn-action-container">
      <button class="btn-action" id="btn-acao-${idx}">
        <span class="key-hint">[${idx + 1}]</span> ${opcao.texto}
      </button>
      ${opcao.descricao ? `<div class="btn-tooltip">${opcao.descricao}</div>` : ""}
    </div>`;
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
  raioNegroStack = 0;
  setParryWindowBonus(0);
  furiaPenalidade = false;
  furiaPenalidadeAtiva = false;
  furiaSkipouPrimeiroTurno = false;
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
  const acessorio = listaAcessorios[loadout.acessorio];
  if (acessorio) jogador.equiparAcessorio(acessorio);
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

  // Fúria Descontrolada: se havia penalidade, ativa agora
  if (furiaPenalidade) {
    furiaPenalidadeAtiva = true;
    furiaPenalidade = false;
    furiaSkipouPrimeiroTurno = false;
  } else {
    furiaPenalidadeAtiva = false;
    furiaSkipouPrimeiroTurno = false;
  }

  menuBatalhaPrincipal();
}

function menuBatalhaPrincipal() {
  if (jogador.life <= 0) {
    estadoAtual = "GAME_OVER";
    opcoesAcao = [{ texto: "Voltar ao Lobby", acao: () => { estadoAtual = "LOBBY"; render(); } }];
    const goldPerdido = Math.floor(jogador.gold / 2);
    const goldGanho = jogador.gold - goldPerdido;
    adicionarGold(goldGanho);
    // Perda de itens do loadout na morte (se não forem os básicos)
    const armadurasBasicas = ["Robes Rasgados", "Vestes de Couro"];
    const acessoriosBasicos = ["Sem Acessório", "Amuleto da Vitalidade", "Anel da Força", "Anel da Sorte"];
    if (jogador.equippedWeapon.name !== "Espada Quebrada") {
      removerItemExtra(jogador.equippedWeapon.name);
    }
    if (jogador.equippedArmor && !armadurasBasicas.includes(jogador.equippedArmor.name)) {
      removerItemExtra(jogador.equippedArmor.name);
    }
    if (jogador.equippedAccessory && !acessoriosBasicos.includes(jogador.equippedAccessory.name)) {
      removerItemExtra(jogador.equippedAccessory.name);
    }

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
    { texto: "Inventário", acao: () => menuInventario() },
    { texto: "Fugir", acao: () => confirmarFuga() }
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
  let danoBase = jogador.danoComArma();
  const mortosVivos = ["Zumbi", "Esqueleto", "Múmia", "Vampiro", "Necromante", "Ghoul", "Lich", "ArquLich"];
  const temDominioDaMorte = jogador.skills.some(s => s.nome === "Domínio da Morte");
  if (temDominioDaMorte && mortosVivos.includes(alvo.name)) {
    danoBase = Math.floor(danoBase * 1.5);
  }

  // Fúria Descontrolada penalidade: -15% dano
  if (furiaPenalidadeAtiva) danoBase = Math.floor(danoBase * 0.85);

  // Raio Negro: bônus de crit acumulado (passiva épica)
  const temRaioNegro = jogador.skills.some(s => s.nome === "Raio Negro");
  const critBase = jogador.taxaCritica;
  const critRaioNegro = temRaioNegro ? 0.05 + (raioNegroStack * 0.10) : 0;
  const critTotal = Math.min(0.65, critBase + critRaioNegro);

  // Fúria Descontrolada: crítico garantido neste combate
  const furiaAtivaNow = jogador.activeBuffs.some(b => b.name === "Fúria Descontrolada");
  const isCrit = furiaAtivaNow || Math.random() < critTotal;
  const danoFinal = Math.floor(isCrit ? danoBase * 2 : danoBase);

  // Atualiza stack do Raio Negro
  if (temRaioNegro) {
    if (isCrit) {
      raioNegroStack = Math.min(raioNegroStack + 1, 6);
    } else {
      raioNegroStack = 0;
    }
  }

  alvo.life -= danoFinal;
  playSfx("hit");
  let lifesteal = 0;
  if (jogador._accessoryPassivaAtiva === "Sangria") {
    lifesteal = Math.floor(danoFinal * 0.1);
    if (lifesteal > 0) jogador.curar(lifesteal);
  }

  let msg = `Você atacou ${alvo.name} causando ${danoFinal} de dano!`;
  if (lifesteal > 0) msg += ` (Roubou ${lifesteal} vida)`;
  if (furiaAtivaNow && isCrit) msg = `🔥 CRÍTICO (FÚria)! ` + msg;
  else if (isCrit) msg = `⚡ CRÍTICO! ` + msg;
  if (temRaioNegro && isCrit) msg += ` (Raio Negro: ${(critTotal * 100).toFixed(0)}% crit — streak ${raioNegroStack})`;
  if (furiaPenalidadeAtiva) msg += ` [ressaca -15% dano]`;
  if (temDominioDaMorte && mortosVivos.includes(alvo.name)) msg += ` [Domínio da Morte +50% dano]`;

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
    jogador.removerEquipamentos();
    atualizarLog(`Você fugiu com sucesso! Extraiu ${jogador.gold}G e todos os seus itens para o Lobby.`);
  } else {
    atualizarLog("Você falhou em fugir!", () => {
      setTimeout(() => {
        turnoInimigo();
      }, 500);
    });
  }
}

function processarMortes(): boolean {
  let mortos = false;
  const temNecromante = jogador.skills.some(s => s.nome === "Domínio da Morte");

  for (let i = inimigosAtuais.length - 1; i >= 0; i--) {
    const alvo = inimigosAtuais[i]!;
    if (alvo.life <= 0) {
      mortos = true;
      jogador.experience += alvo.xpReward;
      jogador.gold += alvo.goldReward;

      // Drops de materiais
      const drops = rolarDrops(alvo.name, jogador.luck);
      if (drops.length > 0) {
        drops.forEach(d => adicionarDrop(d));
        logMensagem += `\n🎒 Drop: ${drops.join(", ")}!`;
      }

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
  processarMortes();
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  // Processa passivas de turno dos equipamentos
  jogador.processarPassivasDeEquipamento(inimigosAtuais);
  processarMortes();
  if (inimigosAtuais.length === 0) {
    vencerBatalha();
    return;
  }

  // --- FASE ALIADOS ---
  if (aliadosAtuais.length > 0) {
    aliadosAtuais = aliadosAtuais.filter(a => a.life > 0);
    if (aliadosAtuais.length > 0) {
      let logAliados = ``;
      aliadosAtuais.forEach(aliado => {
        const alvo = inimigosAtuais[Math.floor(Math.random() * inimigosAtuais.length)]!;
        alvo.life -= aliado.attackPower;
        logAliados += `👻 Seu ${aliado.name} ataca ${alvo.name} por ${aliado.attackPower} dano!\n`;
      });

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

    const encantoLog = `🎵 Encanto do Bardo! ${atacante.name} enlouquece e ataca ${alvoReal.name} por ${dano} de dano!`;
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

  let totalDano = 0;
  jogador.processarBuffs();

  // Atualiza bônus da janela de Parry (habilidade Velocidade)
  const temVelocidade = jogador.activeBuffs.some(b => b.name === "Velocidade");
  setParryWindowBonus(temVelocidade ? 20 : 0); // +20% de janela quando ativo

  inimigosAtuais.forEach(ini => {
    const reducao = Math.min(jogador.defense * 0.005, 0.8);
    let dano = Math.floor(ini.attackPower * (1 - reducao));
    if (dano < 1) dano = 1;
    totalDano += dano;
  });

  opcoesAcao = [];
  render(); // Limpa os botoes antes de mostrar o parry

  showParryBar(
    () => {
      // Parry bem sucedido: sem dano
      atualizarLog(`⚔️ PARRY PERFEITO! Você bloqueou o ataque dos inimigos!`, () => {
        setTimeout(() => menuBatalhaPrincipal(), 500);
      });
    },
    () => {
      // Parry falhou: verifica Evasivo (passiva de esquiva)
      const temEvasivo = jogador.skills.some(s => s.nome === "Evasivo");
      if (temEvasivo) {
        // Chance de esquiva: base 5% + (DEX * 1.75%), teto de 40%
        const chanceEsquiva = Math.min(0.40, 0.05 + jogador.dexterity * 0.0175);
        if (Math.random() < chanceEsquiva) {
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
      jogador.life -= danoFinalAoJogador;
      const bastMsg = jogador._armorPassivaAtiva === "Bastião" ? " [Bastião: -10%]" : "";
      atualizarLog(`Os inimigos atacam e causam ${danoFinalAoJogador} de dano!${bastMsg}`, () => {
        setTimeout(() => menuBatalhaPrincipal(), 500);
      });
    }
  );
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
  const xpBonusSala = (andarAtual * andarAtual * 20) + (salaAtual * andarAtual * 5);
  const goldSala = (andarAtual * 5) + salaAtual;
  jogador.experience += xpBonusSala;
  jogador.gold += goldSala;

  // Cascata de level-ups: upa quantos níveis for possível de uma vez
  let nivelUp = 0;
  while (jogador.experience >= jogador.experienceToNextLevel) {
    jogador.levelUp();
    nivelUp++;
  }

  // BOSS (Sala 10): sempre dá baú
  if (salaAtual === 10) {
    // Check para desbloqueio do Necromante
    // No andar 4 a sala 10 é o Servo das Sombras
    if (andarAtual === 4 && jogador.life >= jogador.maxLife / 2) {
      desbloquearFlag("necromante_unlock");
    }

    const bau = bauDoAndar(andarAtual);
    const recompensa = abrirBau(bau, jogador);
    let msgBau = `🏆 Boss derrotado! Você recebeu um ${bau.nome}!\n`;

    if (recompensa.tipo === "arma") {
      jogador.weaponInventory.push(recompensa.item);
      msgBau += `⚔️ Arma encontrada: ${recompensa.item.name} (${recompensa.item.raridade})`;
    } else {
      jogador.inventory.push(recompensa.item.name);
      msgBau += `🧪 Consumível encontrado: ${recompensa.item.name}`;
    }

    if (nivelUp > 0) {
      estadoAtual = "LEVEL_UP_SKILL";
      atualizarLog(msgBau, () => {
        setTimeout(() => escolherNovaSkillLevelUp(), 800);
      });
    } else {
      estadoAtual = "EXPLORACAO";
      opcoesAcao = [{ texto: "Avançar para próxima sala", acao: () => avancarSala() }];
      atualizarLog(msgBau);
    }
    return;
  }

  // SALA COMUM (1–9): chance de drop aleatório
  // Chance de consumível: 25% | Chance de item/arma: escala com o andar (5% no andar 1 até 20% no andar 10)
  const chanceConsumivel = 0.25;
  const chanceArma = 0.05 + (andarAtual * 0.015); // 5% andar 1 → ~20% andar 10
  const roll = Math.random();

  let msgSala = `Batalha vencida! +${xpBonusSala} XP e +${goldSala}G.`;

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
      msgSala += `\n⚔️ Item encontrado: ${armaDropada.name} (${armaDropada.raridade})!`;
    }
  } else if (roll < chanceArma + chanceConsumivel) {
    // Drop de consumível
    const consumiveis = Object.values(listaConsumiveis);
    const consDropado = consumiveis[Math.floor(Math.random() * consumiveis.length)]!;
    jogador.inventory.push(consDropado.name);
    msgSala += `\n🧪 Consumível encontrado: ${consDropado.name}!`;
  }

  if (nivelUp > 0) {
    estadoAtual = "LEVEL_UP_SKILL";
    atualizarLog(msgSala, () => {
      setTimeout(() => escolherNovaSkillLevelUp(), 800);
    });
  } else {
    estadoAtual = "EXPLORACAO";
    opcoesAcao = [{ texto: "Avançar para próxima sala", acao: () => avancarSala() }];
    atualizarLog(msgSala);
  }
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
    descricao: op.descricao,
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

// Inicia
initSettings();
initMusic();
render();
