import { computed, onUnmounted, ref } from "vue";
import { supabase } from "../lib/supabase";
import type { DraftSessionState } from "../types/draft";

type SessionUser = {
  id: string;
  pseudo: string;
  team_id: string | null;
};

type PresencePayload = {
  playerId: string;
  pseudo: string;
  teamId: string | null;
};

type RequestStatePayload = {
  requesterId: string | null;
};

type StateSyncPayload = {
  state: DraftSessionState;
  from: string | null;
};

export function useRealtimeDraftSession(initialState: DraftSessionState, user: SessionUser | null) {
  const state = ref<DraftSessionState>(initialState);
  const channel = ref<any>(null);
  const connected = ref(false);
  const peers = ref<PresencePayload[]>([]);

  const channelName = `draft-room-${initialState.sessionId}`;

  const isCaptain = computed(() => {
    if (!user?.id) return false;
    return (
      state.value.captainTeam1PlayerId === user.id || state.value.captainTeam2PlayerId === user.id
    );
  });

  const canEditState = computed(() => !!user?.id && isCaptain.value);

  const applyRemoteState = (incoming: DraftSessionState | null | undefined) => {
    if (!incoming) return;
    if (incoming.sessionId !== state.value.sessionId) return;
    if ((incoming.version ?? 0) < (state.value.version ?? 0)) return;
    state.value = incoming;
  };

  const broadcastState = async (nextState: DraftSessionState) => {
    state.value = nextState;
    if (!channel.value) return;
    await channel.value.send({
      type: "broadcast",
      event: "state_update",
      payload: nextState,
    });
  };

  const requestStateSync = async () => {
    if (!channel.value) return;
    const payload: RequestStatePayload = {
      requesterId: user?.id ?? null,
    };
    await channel.value.send({
      type: "broadcast",
      event: "request_state",
      payload,
    });
  };

  const init = async () => {
    const realtimeChannel = supabase.channel(channelName, {
      config: {
        presence: { key: user?.id ?? `spectator-${Date.now()}` },
        broadcast: { self: true },
      },
    });

    realtimeChannel
      .on("broadcast", { event: "state_update" }, (payload) => {
        applyRemoteState(payload.payload as DraftSessionState);
      })
      .on("broadcast", { event: "state_sync" }, (payload) => {
        const syncPayload = payload.payload as StateSyncPayload | undefined;
        applyRemoteState(syncPayload?.state);
      })
      .on("broadcast", { event: "request_state" }, (payload) => {
        const requestPayload = payload.payload as RequestStatePayload | undefined;
        if (!canEditState.value) return;
        if (requestPayload?.requesterId && requestPayload.requesterId === user?.id) return;
        const syncPayload: StateSyncPayload = {
          state: state.value,
          from: user?.id ?? null,
        };
        void realtimeChannel.send({
          type: "broadcast",
          event: "state_sync",
          payload: syncPayload,
        });
      })
      .on("presence", { event: "sync" }, () => {
        const next = realtimeChannel.presenceState<PresencePayload>();
        const all = Object.values(next).flatMap((entries) => entries);
        peers.value = all;
      });

    await realtimeChannel.subscribe((status) => {
      connected.value = status === "SUBSCRIBED";
      if (status === "SUBSCRIBED" && user?.id) {
        void realtimeChannel.track({
          playerId: user.id,
          pseudo: user.pseudo,
          teamId: user.team_id,
        });
      }
      if (status === "SUBSCRIBED") {
        // Ask for an up-to-date snapshot on join/rejoin.
        void requestStateSync();
      }
    });
    channel.value = realtimeChannel;
  };

  const dispose = async () => {
    if (!channel.value) return;
    await supabase.removeChannel(channel.value);
    channel.value = null;
    connected.value = false;
  };

  onUnmounted(() => {
    void dispose();
  });

  return {
    state,
    connected,
    peers,
    isCaptain,
    canEditState,
    init,
    dispose,
    broadcastState,
    requestStateSync,
  };
}
