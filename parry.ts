// parry.ts — Sistema de Parry passivo
// Aparece automaticamente todo turno inimigo

export let parryStreak = 0; // Quantos parrys consecutivos o jogador acertou

// Bônus de janela externo (ex: habilidade Velocidade)
export let parryWindowBonus = 0;
export function setParryWindowBonus(v: number) { parryWindowBonus = v; }

const BASE_SPEED = 2;       // % da barra por frame (base)
const SPEED_INCREMENT = 0.05;  // velocidade extra por streak
const BASE_WINDOW = 15;        // tamanho inicial da janela de sucesso (%)
const WINDOW_DECREMENT = 1.2;  // quanto a janela encolhe por streak
const MIN_WINDOW = 2;          // janela mínima (%)

import { playSfx } from "./music.js";

export function showParryBar(onSuccess: () => void, onFail: () => void): void {
  // Injeta o overlay no DOM para aviso prévio
  const overlay = document.createElement("div");
  overlay.id = "parry-overlay";
  overlay.innerHTML = `
    <div id="parry-container" style="display: flex; justify-content: center; align-items: center; min-height: 150px; font-size: 8rem; color: #ffeb3b; font-weight: bold; text-shadow: 4px 4px 10px rgba(0,0,0,0.8);">
      !
    </div>
  `;
  document.body.appendChild(overlay);
  playSfx("parry");

  setTimeout(() => {
    // Calcula dificuldade atual com base no streak
    const speed = BASE_SPEED + parryStreak * SPEED_INCREMENT;
    const windowSize = Math.max(MIN_WINDOW, BASE_WINDOW - parryStreak * WINDOW_DECREMENT + parryWindowBonus);

    // Posição da janela de sucesso (randomizada levemente, mas sempre com espaço nas bordas)
    const minPos = 15;
    const maxPos = 90 - windowSize;
    const windowPos = minPos + Math.random() * (maxPos - minPos);

    overlay.innerHTML = `
      <div id="parry-container">
        <div id="parry-label">⚔️ PARRY! Pressione <kbd>Espaço</kbd></div>
        <div id="parry-bar">
          <div id="parry-window" style="left: ${windowPos}%; width: ${windowSize}%;"></div>
          <div id="parry-cursor"></div>
        </div>
        <div id="parry-streak">Streak: ${parryStreak} 🔥</div>
      </div>
    `;

    let position = 0; // posição atual do cursor (0-100%)
    let resolved = false;
    let animFrameId: number;

    function resolve(success: boolean) {
      if (resolved) return;
      resolved = true;
      cancelAnimationFrame(animFrameId);
      document.removeEventListener("keydown", onKeyDown);

      const cursor = document.getElementById("parry-cursor");
      if (cursor) {
        cursor.style.backgroundColor = success ? "#51cf66" : "#ff6b6b";
      }

      if (success) {
        parryStreak++;
        showParryResult("PARRY!", "#51cf66");
      } else {
        parryStreak = 0; // reset da dificuldade ao errar
        showParryResult("FALHOU!", "#ff6b6b");
      }

      setTimeout(() => {
        overlay.remove();
        if (success) onSuccess();
        else onFail();
      }, 700);
    }

    function showParryResult(text: string, color: string) {
      const label = document.getElementById("parry-label");
      if (label) {
        label.textContent = text;
        label.style.color = color;
        label.style.fontSize = "2rem";
      }
    }

    function animate() {
      position += speed;
      const cursor = document.getElementById("parry-cursor");
      if (cursor) {
        cursor.style.left = `${position}%`;
      }

      if (position >= 100) {
        resolve(false); // passou do fim sem apertar: falhou
        return;
      }
      animFrameId = requestAnimationFrame(animate);
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.code === "Space") {
        e.preventDefault();
        // Verifica se o cursor está dentro da janela de sucesso
        const inWindow = position >= windowPos && position <= windowPos + windowSize;
        resolve(inWindow);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    animFrameId = requestAnimationFrame(animate);
  }, 1000); // Fim do setTimeout
}

export function resetParryStreak() {
  parryStreak = 0;
}
