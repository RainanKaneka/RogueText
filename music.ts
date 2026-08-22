// Gerenciador de Áudio para RogueText

export type TrackName = "title" | "dungeon" | "boss";
export type SfxName = "hover" | "parry" | "hit";

const tracks: Record<TrackName, string> = {
  title: "/ost/xDeviruchi - Title Theme .wav",
  dungeon: "/ost/xDeviruchi - Mysterious Dungeon.wav",
  boss: "/ost/xDeviruchi - Decisive Battle.wav"
};

const sfxFiles: Record<SfxName, string> = {
  hover: "/ost/sounds/Menu Selection Click.wav",
  parry: "/ost/sounds/sd_0.wav",
  hit: "/ost/sounds/hit01.wav"
};

export let musicVolume: number = 0.05;
export let sfxVolume: number = 0.5;

let currentAudio: HTMLAudioElement | null = null;
let currentTrackName: TrackName | null = null;
export let isMuted: boolean = true;

let heartbeatAudio: HTMLAudioElement | null = null;

// Tenta recuperar os volumes salvos
try {
  const savedMusic = localStorage.getItem("rt_music_vol");
  if (savedMusic !== null) musicVolume = parseFloat(savedMusic);
  
  const savedSfx = localStorage.getItem("rt_sfx_vol");
  if (savedSfx !== null) sfxVolume = parseFloat(savedSfx);
} catch (e) {}

export function initMusic() {
  const muteBtn = document.getElementById("mute-btn");
  if (muteBtn) {
    muteBtn.onclick = () => toggleMute();
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
  }

  // Pre-load heartbeat
  heartbeatAudio = new Audio("/ost/sounds/heartbeat_slow_0.wav");
  heartbeatAudio.loop = true;
}

export function playMusic(track: TrackName) {
  if (currentTrackName === track) return; 

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentTrackName = track;
  currentAudio = new Audio(tracks[track]);
  currentAudio.loop = true;
  currentAudio.volume = musicVolume;

  if (isMuted) {
    currentAudio.muted = true;
  } else {
    currentAudio.play().catch((err) => {
      console.warn("Autoplay blocked by browser. Awaiting user interaction.", err);
    });
  }
}

export function playSfx(type: SfxName) {
  if (isMuted) return;
  const sfx = new Audio(sfxFiles[type]);
  sfx.volume = sfxVolume;
  sfx.play().catch(() => {});
}

export function updateHeartbeat(ratio: number) {
  if (!heartbeatAudio) return;
  
  if (ratio <= 0.25 && ratio > 0) {
    if (heartbeatAudio.paused && !isMuted) {
      heartbeatAudio.volume = sfxVolume;
      heartbeatAudio.play().catch(() => {});
    }
  } else {
    if (!heartbeatAudio.paused) {
      heartbeatAudio.pause();
      heartbeatAudio.currentTime = 0;
    }
  }
}

export function setMusicVolume(v: number) {
  musicVolume = v;
  if (currentAudio) currentAudio.volume = v;
  localStorage.setItem("rt_music_vol", v.toString());
}

export function setSfxVolume(v: number) {
  sfxVolume = v;
  if (heartbeatAudio) heartbeatAudio.volume = v;
  localStorage.setItem("rt_sfx_vol", v.toString());
}

export function toggleMute() {
  isMuted = !isMuted;

  const muteBtn = document.getElementById("mute-btn");
  if (muteBtn) {
    muteBtn.textContent = isMuted ? "🔇" : "🔊";
  }

  if (currentAudio) {
    currentAudio.muted = isMuted;
    if (!isMuted && currentAudio.paused) {
      currentAudio.play().catch(console.error);
    }
  }
  
  if (heartbeatAudio) {
    heartbeatAudio.muted = isMuted;
  }
}
