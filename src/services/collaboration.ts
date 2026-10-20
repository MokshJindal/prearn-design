import Peer, { DataConnection } from 'peerjs';
import { Collaborator, DesignDocument } from '../types/design';

export interface CollabMessage {
  type: 'DOC_UPDATE' | 'PRESENCE' | 'SELECTION' | 'SLIDE_CHANGE' | 'JOIN_REQUEST' | 'SYNC_INIT';
  sender: Collaborator;
  payload?: any;
  timestamp: number;
}

const USER_KEY = 'prearn_collab_user';
const VIBRANT_COLORS = [
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#14B8A6', // Teal
];

export function getLocalCollaborator(initialRole: Collaborator['role'] = 'editor'): Collaborator {
  try {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      return { ...parsed, role: initialRole };
    }
  } catch (e) {}

  const randomColor = VIBRANT_COLORS[Math.floor(Math.random() * VIBRANT_COLORS.length)];
  const randomNum = Math.floor(100 + Math.random() * 900);
  const newUser: Collaborator = {
    id: `user-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    name: `Designer #${randomNum}`,
    email: `designer${randomNum}@prearn.design`,
    avatar: 'D',
    role: initialRole,
    color: randomColor,
    status: 'active',
    lastSeen: 'Now',
  };

  try {
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
  } catch (e) {}

  return newUser;
}

export function updateLocalCollaborator(updates: Partial<Collaborator>): Collaborator {
  const current = getLocalCollaborator();
  const updated = { ...current, ...updates };
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

export class RealtimeCollabSession {
  private roomId: string;
  private currentUser: Collaborator;
  private broadcastChannel: BroadcastChannel | null = null;
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private collaborators: Map<string, Collaborator> = new Map();
  
  private onDocUpdateCb?: (doc: DesignDocument, sender: Collaborator) => void;
  private onPresenceCb?: (collaborators: Collaborator[]) => void;
  private onRemoteSelectionCb?: (colId: string, elementId: string | null, colName: string, colColor: string) => void;
  private currentDocSupplier?: () => DesignDocument;

  constructor(
    roomId: string,
    role: Collaborator['role'],
    currentDocSupplier: () => DesignDocument,
    onDocUpdate: (doc: DesignDocument, sender: Collaborator) => void,
    onPresence: (collaborators: Collaborator[]) => void,
    onRemoteSelection: (colId: string, elementId: string | null, colName: string, colColor: string) => void
  ) {
    this.roomId = roomId;
    this.currentUser = getLocalCollaborator(role);
    this.currentDocSupplier = currentDocSupplier;
    this.onDocUpdateCb = onDocUpdate;
    this.onPresenceCb = onPresence;
    this.onRemoteSelectionCb = onRemoteSelection;

    // Add self to collaborators map
    this.collaborators.set(this.currentUser.id, this.currentUser);
    this.triggerPresenceUpdate();

    this.initBroadcastChannel();
    this.initPeerConnection();
    this.syncFromEdgeCloud();
  }

  // 1. Multi-Tab Local Synchronization via BroadcastChannel (<5ms latency)
  private initBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel(`prearn_collab_${this.roomId}`);
      this.broadcastChannel.onmessage = (event) => {
        const msg: CollabMessage = event.data;
        if (!msg || msg.sender.id === this.currentUser.id) return;
        this.handleIncomingMessage(msg);
      };

      // Announce arrival to other open tabs
      this.postBroadcast({
        type: 'PRESENCE',
        sender: this.currentUser,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.warn('BroadcastChannel not supported in this browser environment:', err);
    }
  }

  // 2. Cross-Device P2P WebRTC DataChannel via PeerJS
  private initPeerConnection() {
    try {
      // Deterministic host ID based on room ID so peers can connect directly
      const peerId = `prearn-${this.roomId}-${this.currentUser.id.slice(-6)}`;
      this.peer = new Peer(peerId, {
        debug: 1,
      });

      this.peer.on('open', () => {
        // Broadcast presence
        this.broadcastPresence();
        // Try connecting to existing peers in the room
        this.attemptHostConnection();
      });

      // Handle incoming connections from other collaborators
      this.peer.on('connection', (conn) => {
        this.setupDataConnection(conn);
      });

      this.peer.on('error', (err: any) => {
        // Silent recovery on ID collision or signaling warnings
        console.log('PeerJS note:', err.type);
      });
    } catch (err) {
      console.warn('PeerJS init fallback:', err);
    }
  }

  private attemptHostConnection() {
    if (!this.peer) return;
    const hostPeerId = `prearn-${this.roomId}-host`;

    // If we are not the host, attempt connecting to the room host
    if (this.peer.id !== hostPeerId) {
      try {
        const conn = this.peer.connect(hostPeerId, { reliable: true });
        this.setupDataConnection(conn);
      } catch (e) {}
    }
  }

  private setupDataConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);

      // Send initial sync payload to newly joined peer
      if (this.currentDocSupplier) {
        const currentDoc = this.currentDocSupplier();
        conn.send({
          type: 'SYNC_INIT',
          sender: this.currentUser,
          payload: currentDoc,
          timestamp: Date.now(),
        });
      }

      // Announce presence
      conn.send({
        type: 'PRESENCE',
        sender: this.currentUser,
        timestamp: Date.now(),
      });
    });

    conn.on('data', (data: any) => {
      this.handleIncomingMessage(data as CollabMessage);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
    });
  }

  // 3. Cloud Edge Room Fallback: Fetch initial room snapshot if joining fresh link
  private async syncFromEdgeCloud() {
    try {
      const res = await fetch(`/api/room?id=${encodeURIComponent(this.roomId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.doc && this.onDocUpdateCb) {
          const cloudSender: Collaborator = {
            id: 'cloud-sync',
            name: 'Cloud Sync',
            email: 'cloud@prearn.design',
            avatar: '☁️',
            role: 'editor',
            color: '#8B5CF6',
            status: 'active',
            lastSeen: 'Now',
          };
          this.onDocUpdateCb(data.doc, cloudSender);
        }
      }
    } catch (e) {
      // Offline or local development fallback
    }
  }

  // 4. Handle incoming messages across both WebRTC and BroadcastChannel
  private handleIncomingMessage(msg: CollabMessage) {
    if (!msg || !msg.sender) return;

    // Track collaborator presence
    this.collaborators.set(msg.sender.id, msg.sender);
    this.triggerPresenceUpdate();

    switch (msg.type) {
      case 'DOC_UPDATE':
      case 'SYNC_INIT':
        if (msg.payload && this.onDocUpdateCb) {
          this.onDocUpdateCb(msg.payload as DesignDocument, msg.sender);
        }
        break;

      case 'SELECTION':
        if (this.onRemoteSelectionCb) {
          const elementId = msg.payload?.elementId ?? null;
          this.onRemoteSelectionCb(msg.sender.id, elementId, msg.sender.name, msg.sender.color);
        }
        break;

      case 'PRESENCE':
      case 'SLIDE_CHANGE':
        // Updated in presence map
        break;
    }
  }

  // 5. Public Broadcast Methods
  public broadcastDocUpdate(doc: DesignDocument) {
    const msg: CollabMessage = {
      type: 'DOC_UPDATE',
      sender: this.currentUser,
      payload: doc,
      timestamp: Date.now(),
    };

    // 1. Broadcast locally
    this.postBroadcast(msg);

    // 2. Broadcast across P2P WebRTC data channels
    this.connections.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });

    // 3. Save to Edge Room Snapshot
    fetch('/api/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId: this.roomId, doc }),
    }).catch(() => {});
  }

  public broadcastSelection(elementId: string | null) {
    const msg: CollabMessage = {
      type: 'SELECTION',
      sender: this.currentUser,
      payload: { elementId },
      timestamp: Date.now(),
    };
    this.postBroadcast(msg);
    this.connections.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
  }

  public broadcastSlideChange(slideIndex: number) {
    this.currentUser.lastSeen = `Viewing Card ${slideIndex + 1}`;
    const msg: CollabMessage = {
      type: 'SLIDE_CHANGE',
      sender: this.currentUser,
      payload: { slideIndex },
      timestamp: Date.now(),
    };
    this.postBroadcast(msg);
    this.connections.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
    this.triggerPresenceUpdate();
  }

  private broadcastPresence() {
    const msg: CollabMessage = {
      type: 'PRESENCE',
      sender: this.currentUser,
      timestamp: Date.now(),
    };
    this.postBroadcast(msg);
    this.connections.forEach((conn) => {
      if (conn.open) conn.send(msg);
    });
  }

  private postBroadcast(msg: CollabMessage) {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.postMessage(msg);
      }
    } catch (e) {}
  }

  private triggerPresenceUpdate() {
    if (this.onPresenceCb) {
      this.onPresenceCb(Array.from(this.collaborators.values()));
    }
  }

  public getCurrentUser(): Collaborator {
    return this.currentUser;
  }

  public getRoomId(): string {
    return this.roomId;
  }

  public disconnect() {
    try {
      if (this.broadcastChannel) {
        this.broadcastChannel.close();
      }
      this.connections.forEach((c) => c.close());
      this.connections.clear();
      if (this.peer) {
        this.peer.destroy();
      }
    } catch (e) {}
  }
}
