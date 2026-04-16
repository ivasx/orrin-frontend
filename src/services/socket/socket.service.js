const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://127.0.0.1:8000';
const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

class MockSocket {
    constructor() {
        this._listeners = {};
        this._typingTimers = {};
        this._connected = false;
    }

    connect(chatId) {
        this._connected = true;
        this._chatId = chatId;
    }

    disconnect() {
        this._connected = false;
        this._chatId = null;
        Object.values(this._typingTimers).forEach(clearTimeout);
        this._typingTimers = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    }

    off(event) {
        delete this._listeners[event];
    }

    emit(event, data) {
        if (!this._connected) return;

        if (event === 'typing_start') {
            const opponentId = 'user-opponent-mock';

            this._fire('typing_start', { senderId: opponentId, chatId: data.chatId });

            clearTimeout(this._typingTimers[opponentId]);
            this._typingTimers[opponentId] = setTimeout(() => {
                this._fire('typing_stop', { senderId: opponentId, chatId: data.chatId });
            }, 2500);
        }
    }

    simulateIncoming(message) {
        setTimeout(() => {
            this._fire('receive_message', message);
        }, 600);
    }

    _fire(event, payload) {
        const handlers = this._listeners[event] || [];
        handlers.forEach((fn) => fn(payload));
    }
}

class RealSocket {
    constructor() {
        this._socket = null;
        this._listeners = {};
        this._chatId = null;
        this._reconnectAttempts = 0;
        this._maxReconnectAttempts = 5;
        this._reconnectDelay = 1000;
        this._reconnectTimer = null;
        this._intentionalClose = false;
    }

    connect(chatId) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN && this._chatId === chatId) {
            return;
        }

        this.disconnect();
        this._intentionalClose = false;
        this._chatId = chatId;

        const token = localStorage.getItem('access_token');
        const url = token
            ? `${WS_BASE_URL}/ws/chat/${chatId}/?token=${token}`
            : `${WS_BASE_URL}/ws/chat/${chatId}/`;

        this._socket = new WebSocket(url);

        this._socket.onopen = () => {
            this._reconnectAttempts = 0;
        };

        this._socket.onmessage = (event) => {
            let parsed;
            try {
                parsed = JSON.parse(event.data);
            } catch {
                return;
            }

            const { type, ...payload } = parsed;
            if (type && this._listeners[type]) {
                this._listeners[type].forEach((fn) => fn(payload));
            }
        };

        this._socket.onclose = (event) => {
            if (!this._intentionalClose && this._reconnectAttempts < this._maxReconnectAttempts) {
                this._reconnectAttempts++;
                const delay = this._reconnectDelay * Math.pow(2, this._reconnectAttempts - 1);
                this._reconnectTimer = setTimeout(() => {
                    this.connect(this._chatId);
                }, delay);
            }
        };

        this._socket.onerror = () => {};
    }

    disconnect() {
        this._intentionalClose = true;
        clearTimeout(this._reconnectTimer);

        if (this._socket) {
            this._socket.onopen = null;
            this._socket.onmessage = null;
            this._socket.onclose = null;
            this._socket.onerror = null;

            if (
                this._socket.readyState === WebSocket.OPEN ||
                this._socket.readyState === WebSocket.CONNECTING
            ) {
                this._socket.close(1000, 'Client disconnect');
            }
            this._socket = null;
        }

        this._chatId = null;
        this._reconnectAttempts = 0;
    }

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
    }

    off(event) {
        delete this._listeners[event];
    }

    emit(event, data) {
        if (!this._socket || this._socket.readyState !== WebSocket.OPEN) return;

        this._socket.send(
            JSON.stringify({ type: event, ...data })
        );
    }
}

class SocketService {
    constructor() {
        if (SocketService._instance) {
            return SocketService._instance;
        }

        this._impl = USE_MOCK ? new MockSocket() : new RealSocket();
        SocketService._instance = this;
    }

    connect(chatId) {
        this._impl.connect(chatId);
    }

    disconnect() {
        this._impl.disconnect();
    }

    on(event, callback) {
        this._impl.on(event, callback);
    }

    off(event) {
        this._impl.off(event);
    }

    emit(event, data) {
        this._impl.emit(event, data);
    }

    get _mockImpl() {
        return USE_MOCK ? this._impl : null;
    }
}

SocketService._instance = null;

export const socketService = new SocketService();