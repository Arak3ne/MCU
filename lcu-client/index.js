import { app, BrowserWindow, ipcMain, shell, Tray, Menu } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'league-connect';
const { authenticate, createWebSocketConnection, createHttp1Request } = pkg;
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let tray = null;
let supabase;
let lcuCredentials = null;
let isLcuConnected = false;
let lastKnownMatchId = null;
let historyCheckInterval = null;
let lcuReconnectTimeout = null;
let syncInProgress = false;

let currentPlayer = null;

/** Comparaison fiable quel que soit le typage renvoyé par le LCU (number/string). */
function matchIdsEqual(a, b) {
  return String(a) === String(b);
}

/** Envoie les évènements synchro au renderer par `send` (depuis le processus principal). */
function notifyRendererSync(channel, payload) {
  if (mainWindow) mainWindow.webContents.send(channel, payload);
}

/**
 * Synchronisation LCU → Supabase.
 * `replyFn(channel, payload)` : `event.reply` côté IPC, ou `notifyRendererSync` pour l’auto / la barre système.
 */
async function runSyncMatches(replyFn) {
  if (syncInProgress) {
    sendLog('[Sync] Une synchronisation est déjà en cours, ignorée.');
    return;
  }
  syncInProgress = true;
  notifyRendererSync('sync-busy', true);

  const notify = replyFn;

  try {
    if (!isLcuConnected || !lcuCredentials) {
      notify('sync-error', 'LCU not connected');
      return;
    }

    if (!currentPlayer) {
      notify('sync-error', 'Veuillez vous connecter avec votre Riot ID');
      return;
    }

    notify('sync-status', 'Fetching summoner...');
    const summonerResponse = await createHttp1Request({
      method: 'GET',
      url: '/lol-summoner/v1/current-summoner'
    }, lcuCredentials);

    const summoner = await summonerResponse.json();
    const puuid = summoner.puuid;
    const riotId = `${summoner.gameName}#${summoner.tagLine}`;

    const expectedId = currentPlayer.riot_id || currentPlayer.pseudo;

    if (riotId.toLowerCase() !== expectedId.toLowerCase()) {
      notify('sync-error', `Le compte League of Legends actuel (${riotId}) ne correspond pas au compte MCU (${expectedId}).`);
      return;
    }

    notify('sync-status', `Found summoner: ${riotId}. Fetching matches...`);

    const historyResponse = await createHttp1Request({
      method: 'GET',
      url: `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=9`
    }, lcuCredentials);

    const history = await historyResponse.json();
    const games = history.games?.games || [];

    if (games.length === 0) {
      notify('sync-status', 'No matches found.');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gamesToProcess = games.filter((g) => {
      const gameDate = new Date(g.gameCreation);
      return (
        g.gameType === 'CUSTOM_GAME' &&
        g.gameMode === 'CLASSIC' &&
        gameDate >= today
      );
    });

    if (gamesToProcess.length === 0) {
      notify('sync-status', 'Aucune Custom Game récente trouvée.');
      return;
    }

    notify('sync-status', `Processing ${gamesToProcess.length} matches...`);

    let processedCount = 0;

    for (const game of gamesToProcess) {
      const gameId = game.gameId;

      const { data: existingMatch } = await supabase
        .from('match_history')
        .select('id')
        .eq('game_id', gameId)
        .single();

      if (existingMatch) continue;

      const matchDetailsResponse = await createHttp1Request(
        {
          method: 'GET',
          url: `/lol-match-history/v1/games/${gameId}`
        },
        lcuCredentials
      );

      const matchDetails = await matchDetailsResponse.json();

      const matchParticipants = matchDetails.participants || [];
      sendLog(`[Sync] Match ${gameId} : ${matchParticipants.length} joueurs trouvés`);

      sendLog(`[Sync] Appel de l'Edge Function pour le match ${gameId}...`);
      const { data, error } = await supabase.functions.invoke(
        'sync-match-results',
        {
          body: matchDetails
        }
      );

      if (error) {
        console.error(`[Sync] Erreur Edge Function pour ${gameId}:`, error);
        sendLog(`[Sync] Erreur lors du traitement du match ${gameId}`);
      } else {
        console.log(`[Sync] Succès Edge Function pour ${gameId}:`, data);
        sendLog(`[Sync] Match ${gameId} traité avec succès !`);
        processedCount++;
      }
    }

    if (processedCount > 0) {
      notify('sync-success', `${processedCount} nouveau(x) match(s) synchronisé(s) !`);
    } else {
      notify('sync-success', 'Aucun nouveau match à synchroniser.');
    }

    await refreshLastKnownMatchIdFromLcU();
  } catch (error) {
    console.error(error);
    notify('sync-error', error.message);
  } finally {
    syncInProgress = false;
    notifyRendererSync('sync-busy', false);
  }
}

async function refreshLastKnownMatchIdFromLcU() {
  if (!lcuCredentials || !currentPlayer) return;
  try {
    const summonerResponse = await createHttp1Request(
      {
        method: 'GET',
        url: '/lol-summoner/v1/current-summoner'
      },
      lcuCredentials
    );
    const summoner = await summonerResponse.json();
    const riotId = `${summoner.gameName}#${summoner.tagLine}`;
    const expectedId = currentPlayer.riot_id || currentPlayer.pseudo;
    if (riotId.toLowerCase() !== expectedId.toLowerCase()) return;

    const puuid = summoner.puuid;
    const historyResponse = await createHttp1Request(
      {
        method: 'GET',
        url: `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=0`
      },
      lcuCredentials
    );
    const history = await historyResponse.json();
    const games = history.games?.games || [];
    if (games.length > 0) {
      lastKnownMatchId = games[0].gameId;
      sendLog(`[Sync] Référence dernier match alignée après synchro (${lastKnownMatchId})`);
    }
  } catch (e) {
    sendLog(`[Sync] Impossible de rafraîchir le dernier match connu: ${e.message}`);
  }
}

// Initialize Supabase
const SUPABASE_URL = 'https://dqoixaksmbdmbkbtphpt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxb2l4YWtzbWJkbWJrYnRwaHB0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc1Mjg2NjksImV4cCI6MjA5MzEwNDY2OX0.NDVtX2Hgfq-W0L6JfuzW9PS7zz7moS9Z5V_oLHKRW_o';

supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ignore TLS errors for LCU's self-signed certs
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Handle deep links
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('mcu-app', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('mcu-app');
}

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // Windows deep link handling
    const url = commandLine.pop();
    handleDeepLink(url);
  });

  app.whenReady().then(() => {
    createWindow();
    createTray();
    setupLcuConnection();
  });

  app.on('open-url', (event, url) => {
    // macOS deep link handling
    event.preventDefault();
    handleDeepLink(url);
  });
}

function handleDeepLink(url) {
  if (url && url.startsWith('mcu-app://')) {
    // Extract token or session from URL
    // Example: mcu-app://auth?access_token=...&refresh_token=...
    const urlObj = new URL(url);
    const accessToken = urlObj.searchParams.get('access_token');
    const refreshToken = urlObj.searchParams.get('refresh_token');
    
    if (accessToken && refreshToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error }) => {
        if (!error && mainWindow) {
          mainWindow.webContents.send('auth-success', data.session.user);
        }
      });
    }
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 450,
    height: 600,
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Supprimer complètement la barre de menu
  mainWindow.setMenu(null);

  // Empêcher l'application de se fermer complètement quand on clique sur la croix
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });

  mainWindow.loadFile('index.html');
}

function createTray() {
  tray = new Tray(path.join(__dirname, 'icon.png'));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Ouvrir MorueTracker', click: () => mainWindow.show() },
    {
      label: 'Forcer la synchronisation',
      click: () => {
        void runSyncMatches(notifyRendererSync);
        tray.displayBalloon({
          title: 'MorueTracker',
          content: 'Synchronisation lancée...',
          iconType: 'info'
        });
      }
    },
    { type: 'separator' },
    { label: 'Quitter', click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('MorueTracker');
  tray.setContextMenu(contextMenu);
  
  // Afficher la fenêtre quand on double-clique sur l'icône
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

function sendLog(msg) {
  console.log(msg);
  if (mainWindow) {
    mainWindow.webContents.send('debug-log', msg);
  }
}

async function setupLcuConnection() {
  if (lcuReconnectTimeout) {
    clearTimeout(lcuReconnectTimeout);
    lcuReconnectTimeout = null;
  }

  try {
    sendLog('Tentative de connexion au LCU...');
    const credentials = await authenticate();
    sendLog(`Credentials trouvés: Port ${credentials.port}`);
    
    lcuCredentials = credentials;
    isLcuConnected = true;
    if (mainWindow) {
      mainWindow.webContents.send('lcu-status', { connected: true, message: 'Connecté au LCU' });
    }

    sendLog('Connexion au websocket LCU...');
    const ws = await createWebSocketConnection({
      authenticationOptions: {
        awaitConnection: true
      }
    });
    
    sendLog('Websocket LCU connecté et prêt. Configuration des abonnements...');
    isLcuConnected = true;
    if (mainWindow) mainWindow.webContents.send('lcu-status', { connected: true });
    
    // S'abonner aux mises à jour de l'historique des matchs
    ws.subscribe('/lol-match-history/v1/recently-played-summoners', (data, event) => {
      sendLog(`[WS] Mise à jour de l'historique détectée !`);
      setTimeout(checkForNewMatches, 2000);
      setTimeout(checkForNewMatches, 10000);
    });
    
    // S'abonner aussi à la fin de partie (au cas où l'historique met du temps)
    ws.subscribe('/lol-gameflow/v1/gameflow-phase', (data, event) => {
      if (data === 'EndOfGame' || data === 'WaitingForStats') {
        sendLog(`[WS] Fin de partie détectée (${data}). Vérifications planifiées...`);
        setTimeout(checkForNewMatches, 5000);
        setTimeout(checkForNewMatches, 15000);
        setTimeout(checkForNewMatches, 30000);
        setTimeout(checkForNewMatches, 45000);
        setTimeout(checkForNewMatches, 75000);
      }
    });
    
    // S'abonner à l'événement de fin de partie spécifique (utile pour les custom games solo)
    ws.subscribe('/lol-end-of-game/v1/eog-stats-block', async (data, event) => {
      sendLog(`[WS] Écran des scores détecté !`);
      
      if (data && data.gameId) {
        sendLog(`[WS] ID de la partie récupéré instantanément: ${data.gameId}`);
        // Déclenche la synchronisation immédiate sans attendre l'historique global
        syncGameById(data.gameId);
      }

      setTimeout(checkForNewMatches, 3000);
      setTimeout(checkForNewMatches, 10000);
      setTimeout(checkForNewMatches, 20000);
      setTimeout(checkForNewMatches, 45000);
    });
    
    // Lancer une première vérification immédiatement pour initialiser lastKnownMatchId
    checkForNewMatches();
    
    // Lancer une vérification périodique toutes les 15 secondes au cas où les événements WS sont manqués
    if (!historyCheckInterval) {
      historyCheckInterval = setInterval(() => {
        checkForNewMatches(true); // true = silent mode
      }, 15000);
    }

    ws.on('close', () => {
      sendLog('Websocket LCU déconnecté. Tentative de reconnexion dans 5s...');
      isLcuConnected = false;
      lcuCredentials = null;
      if (mainWindow) mainWindow.webContents.send('lcu-status', { connected: false, message: 'Déconnecté du LCU' });

      if (historyCheckInterval) {
        clearInterval(historyCheckInterval);
        historyCheckInterval = null;
      }
      
      // Relancer la connexion
      setTimeout(setupLcuConnection, 5000);
    });

  } catch (e) {
    sendLog(`Erreur LCU: ${e.message}`);
    // LCU not running yet
    isLcuConnected = false;
    if (mainWindow) mainWindow.webContents.send('lcu-status', { connected: false });
    
    // Retry every 5 seconds
    setTimeout(setupLcuConnection, 5000);
  }
}

async function syncGameById(gameId) {
  if (!isLcuConnected || !lcuCredentials || !currentPlayer) {
    sendLog(`[Sync Rapide] Annulé: conditions non remplies.`);
    return;
  }

  try {
    sendLog(`[Sync Rapide] Tentative de récupération immédiate du match ${gameId}...`);
    
    // Check if match exists in DB first to avoid duplicate calls
    const { data: existingMatch } = await supabase
      .from('match_history')
      .select('id')
      .eq('game_id', gameId)
      .maybeSingle();
      
    if (existingMatch) {
      sendLog(`[Sync Rapide] Le match ${gameId} est déjà en base.`);
      return;
    }

    const matchDetailsResponse = await createHttp1Request({
      method: 'GET',
      url: `/lol-match-history/v1/games/${gameId}`
    }, lcuCredentials);
    
    if (matchDetailsResponse.status !== 200) {
      sendLog(`[Sync Rapide] Le match n'est pas encore disponible dans l'API (Status ${matchDetailsResponse.status}).`);
      return; // It will be caught by the 15s auto-sync later
    }
    
    const matchDetails = await matchDetailsResponse.json();
    
    // Check if it's a Custom Game Classic
    if (matchDetails.gameMode !== 'CLASSIC' || matchDetails.gameType !== 'CUSTOM_GAME') {
      sendLog(`[Sync Rapide] Ignoré: Ce n'est pas une Custom Game Classic.`);
      return;
    }
    
    const matchParticipants = matchDetails.participants || [];
    sendLog(`[Sync Rapide] Match ${gameId} : ${matchParticipants.length} joueurs trouvés`);

    // Call the Edge Function
    sendLog(`[Sync Rapide] Appel de l'Edge Function pour le match ${gameId}...`);
    const { data, error } = await supabase.functions.invoke('sync-match-results', {
      body: matchDetails
    });

    if (error) {
      console.error(`[Sync Rapide] Erreur Edge Function pour ${gameId}:`, error);
      sendLog(`[Sync Rapide] Erreur lors du traitement du match ${gameId}`);
    } else {
      console.log(`[Sync Rapide] Succès Edge Function pour ${gameId}:`, data);
      sendLog(`[Sync Rapide] Match ${gameId} traité avec succès !`);
      if (mainWindow) {
        // Just trigger a UI update saying it succeeded
        mainWindow.webContents.send('sync-success', `Match ${gameId} synchronisé instantanément !`);
      }
    }
  } catch (error) {
    sendLog(`[Sync Rapide] Erreur: ${error.message}`);
  }
}

// Fonction pour vérifier périodiquement si un nouveau match est apparu
async function checkForNewMatches(isSilent = false) {
  if (!isLcuConnected || !lcuCredentials || !currentPlayer) {
    if (!isSilent) sendLog(`[Sync Auto] Annulé: conditions non remplies. LCU: ${isLcuConnected}, Joueur: ${currentPlayer ? 'Oui' : 'Non'}`);
    return;
  }

  try {
    // 1. Récupérer le PUUID du joueur connecté
    const summonerResponse = await createHttp1Request({
      method: 'GET',
      url: '/lol-summoner/v1/current-summoner'
    }, lcuCredentials);
    
    const summoner = await summonerResponse.json();
    const puuid = summoner.puuid;
    const riotId = `${summoner.gameName}#${summoner.tagLine}`;

    const expectedId = currentPlayer.riot_id || currentPlayer.pseudo;
    if (riotId.toLowerCase() !== expectedId.toLowerCase()) {
      if (!isSilent) sendLog(`[Sync Auto] Compte ignoré (${riotId} vs ${expectedId})`);
      return; // Ne pas spammer les logs si le compte ne correspond pas
    }

    if (!isSilent) sendLog(`[Sync Auto] Vérification de l'historique pour ${riotId}...`);

    // 2. Récupérer l'historique récent
    const historyResponse = await createHttp1Request({
      method: 'GET',
      url: `/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=9`
    }, lcuCredentials);
    
    const history = await historyResponse.json();
    const games = history.games?.games || [];
    
    if (!isSilent) sendLog(`[Sync Auto] ${games.length} matchs trouvés dans l'historique.`);
    
    // 3. Filtrer les Custom Games d'aujourd'hui
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const gamesToProcess = games.filter(g => {
      const gameDate = new Date(g.gameCreation);
      return g.gameType === 'CUSTOM_GAME' && 
             g.gameMode === 'CLASSIC' &&
             gameDate >= today;
    });

    if (!isSilent) sendLog(`[Sync Auto] ${gamesToProcess.length} Custom Games (CLASSIC) aujourd'hui.`);

    if (gamesToProcess.length === 0) return;

    // 4. Vérifier si un de ces matchs manque dans la base de données
    let hasNewGame = false;
    for (const game of gamesToProcess) {
      const { data: existingMatch, error } = await supabase
        .from('match_history')
        .select('id')
        .eq('game_id', game.gameId)
        .maybeSingle();
        
      if (error) {
        sendLog(`[Sync Auto] Erreur Supabase lors de la vérification du match ${game.gameId}: ${error.message}`);
      }
        
      if (!existingMatch) {
        sendLog(`[Sync Auto] Le match ${game.gameId} n'est pas en BDD !`);
        hasNewGame = true;
        break;
      }
    }

    if (hasNewGame) {
      sendLog(`[Sync Auto] NOUVEAU MATCH DÉTECTÉ ! Déclenchement de la synchro...`);
      if (mainWindow) {
        mainWindow.webContents.send('trigger-auto-sync');
      }
    } else {
      if (!isSilent) sendLog(`[Sync Auto] Tous les matchs récents sont déjà en base de données.`);
    }
  } catch (error) {
    sendLog(`[Sync Auto] Erreur: ${error.message}`);
  }
}

ipcMain.on('login-riot-id', async (event, riotId) => {
  // On cherche d'abord dans la colonne riot_id (qui est la plus à jour), sinon dans pseudo
  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .or(`riot_id.ilike.${riotId},pseudo.ilike.${riotId}`)
    .limit(1)
    .single();
    
  if (error || !player) {
    event.reply('login-error', "Joueur introuvable. Assurez-vous d'avoir créé un compte sur le site MCU et d'avoir renseigné votre Riot ID.");
  } else {
    currentPlayer = player;
    // On renvoie le riot_id s'il existe, sinon le pseudo
    const displayId = player.riot_id || player.pseudo;
    event.reply('auth-success', { ...player, displayId });
    
    // Cacher la fenêtre dans le System Tray après 2 secondes pour être discret
    setTimeout(() => {
      if (mainWindow) {
        mainWindow.hide();
        // Optionnel: afficher une petite notification Windows
        if (tray) {
          tray.displayBalloon({
            title: 'MorueTracker',
            content: 'L\'application tourne en arrière-plan !',
            iconType: 'info'
          });
        }
      }
    }, 2000);
    
    // Si on est déjà connecté au LCU, on lance une vérification de l'historique tout de suite
    if (isLcuConnected && lcuCredentials) {
      checkForNewMatches();
    }
  }
});

ipcMain.on('sync-matches', async (event) => {
  await runSyncMatches((channel, payload) => event.reply(channel, payload));
});
