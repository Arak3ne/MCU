import { ref } from 'vue';

export function useDraftAudio() {
  // Instances audio
  let lockSound: HTMLAudioElement | null = null;
  let tickSound: HTMLAudioElement | null = null;
  let yourTurnSound: HTMLAudioElement | null = null;
  let bgMusic: HTMLAudioElement | null = null;
  let configMusic: HTMLAudioElement | null = null;
  let draftEndSound: HTMLAudioElement | null = null;
  let clickSound: HTMLAudioElement | null = null;

  // Pointeur vers la piste musicale actuellement censée jouer
  let activeTrack: HTMLAudioElement | null = null;

  const isMuted = ref(false);

  // Initialisation des sons (à appeler lors d'une interaction utilisateur)
  const initAudio = () => {
    if (lockSound) return; // Déjà initialisé

    try {
      lockSound = new Audio('/sounds/lockin.ogg');
      lockSound.volume = 0.8;

      tickSound = new Audio('/sounds/tick.ogg');
      tickSound.volume = 0.6;

      yourTurnSound = new Audio('/sounds/your_turn.ogg');
      yourTurnSound.volume = 0.7;

      bgMusic = new Audio('/sounds/draft_music.ogg');
      bgMusic.volume = 0.15; // Volume plus bas pour la musique de fond
      bgMusic.loop = true;

      configMusic = new Audio('/sounds/config_music.ogg');
      configMusic.volume = 0.15;
      configMusic.loop = true;

      draftEndSound = new Audio('/sounds/draft_end.ogg');
      draftEndSound.volume = 0.3;

      clickSound = new Audio('/sounds/click.ogg');
      clickSound.volume = 0.4; // Volume modéré pour ne pas être trop intrusif
    } catch (e) {
      console.warn("L'audio n'est pas supporté ou les fichiers sont manquants", e);
    }
  };

  const playLockSound = () => {
    if (!lockSound || isMuted.value) return;
    lockSound.currentTime = 0;
    lockSound.play().catch(e => console.warn("Autoplay bloqué pour lockSound", e));
  };

  const playTickSound = () => {
    if (!tickSound || isMuted.value) return;
    tickSound.currentTime = 0;
    tickSound.play().catch(e => console.warn("Autoplay bloqué pour tickSound", e));
  };

  const playYourTurnSound = () => {
    if (!yourTurnSound || isMuted.value) return;
    yourTurnSound.currentTime = 0;
    yourTurnSound.play().catch(e => console.warn("Autoplay bloqué pour yourTurnSound", e));
  };

  const playClickSound = () => {
    if (!clickSound || isMuted.value) return;
    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.warn("Autoplay bloqué pour clickSound", e));
  };

  const startConfigMusic = () => {
    if (!configMusic) return;
    if (activeTrack && activeTrack !== configMusic) {
      activeTrack.pause();
      activeTrack.currentTime = 0;
    }
    activeTrack = configMusic;
    if (!isMuted.value) {
      configMusic.play().catch(e => console.warn("Autoplay bloqué pour la musique de config", e));
    }
  };

  const startBackgroundMusic = () => {
    if (!bgMusic) return;
    if (activeTrack && activeTrack !== bgMusic) {
      activeTrack.pause();
      activeTrack.currentTime = 0;
    }
    activeTrack = bgMusic;
    if (!isMuted.value) {
      bgMusic.play().catch(e => console.warn("Autoplay bloqué pour la musique de fond", e));
    }
  };

  const stopAllMusic = () => {
    if (activeTrack) {
      activeTrack.pause();
      activeTrack.currentTime = 0;
      activeTrack = null;
    }
  };

  const playDraftEndSound = () => {
    stopAllMusic();
    if (!draftEndSound || isMuted.value) return;
    draftEndSound.currentTime = 0;
    draftEndSound.play().catch(e => console.warn("Autoplay bloqué pour le son de fin", e));
  };

  const toggleMute = () => {
    isMuted.value = !isMuted.value;
    if (isMuted.value) {
      if (activeTrack) activeTrack.pause();
      if (draftEndSound) draftEndSound.pause();
    } else {
      if (activeTrack) {
        activeTrack.play().catch(e => console.warn("Autoplay bloqué lors du unmute", e));
      }
    }
  };

  return {
    isMuted,
    initAudio,
    playLockSound,
    playTickSound,
    playYourTurnSound,
    playClickSound,
    startConfigMusic,
    startBackgroundMusic,
    stopAllMusic,
    playDraftEndSound,
    toggleMute
  };
}
