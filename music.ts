// Gerenciador de Música para RogueText

export type TrackName = "title" | "dungeon" | "boss";

const tracks: Record<TrackName, string> = {
  title: "/ost/xDeviruchi - Title Theme .wav",
  dungeon: "/ost/xDeviruchi - Mysterious Dungeon.wav",
  boss: "/ost/xDeviruchi - Decisive Battle.wav"
};

let currentAudio: HTMLAudioElement | null = null;
let currentTrackName: TrackName | null = null;
let isMuted: boolean = true;

export function initMusic() {
  const muteBtn = document.getElementById("mute-btn");
  if (muteBtn) {
    muteBtn.onclick = () => toggleMute();
  }
}

export function playMusic(track: TrackName) {
  if (currentTrackName === track) return; // Already playing

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }

  currentTrackName = track;
  currentAudio = new Audio(tracks[track]);
  currentAudio.loop = true;
  currentAudio.volume = 0.05;

  if (isMuted) {
    currentAudio.muted = true;
  } else {
    // Attempt to autoplay
    currentAudio.play().catch((err) => {
      console.warn("Autoplay blocked by browser. Awaiting user interaction.", err);
      // We could visually indicate that audio is blocked, but user interaction will fix it
    });
  }
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
}
