export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const TOKEN_KEY = "officeverse_token";
export const USER_KEY = "officeverse_user";
export const DEFAULT_AVATAR = "/images/default_avatar.png";
export const SOCKET_URL = "wss://api.officeverse.com/socket";

export const NETWORK_CONFIG = {
    WS_URL: import.meta.env.VITE_WS_URL || "ws://localhost:8080"
};

export const ROLES = {
    ADMIN: "admin",
    USER: "user",
    GUEST: "guest"
};

export const STATUS = {
    ONLINE: "online",
    OFFLINE: "offline",
    AWAY: "away",
    BUSY: "busy"
};
