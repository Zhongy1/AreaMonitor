export const CONFIG = {
    WEB_SERVER_PORT: 3000,
    NODE_LOGIC_PORT: 3001,
    PT_CTRL_PORT: 3002,
    VID_PROC_PORT: 3003,
    VID_RETR_PORT: 3004,
    REVERSE_PROXY_SERVER_PORT: 3005,

    DEFAULT_VID_DIRECTORY: 'storage',

    WPA_CONFIGURABLE: false,
    WPA_SUPPLICANT_PATH: '/etc/wpa_supplicant/wpa_supplicant.conf',
    WPA_RESTART: 'systemctl restart wpa_supplicant',

    SIGNAL_MIN_INTERVAL: 1000,
    INACTIVITY_TIMER: 20000,
    SIGNAL_IGNORE_TIMER: 4000,

    LOG_WEB_SERVER: false,
    LOG_VIDEO_SERVER: false,
    DEBUG_CAM_SIGNALS: true,
    DEBUG_UI_FORMS: true
}