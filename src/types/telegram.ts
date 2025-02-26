// src/types/telegram.ts - [update]
export interface TelegramWebApp {
    initData: string;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name: string;
        last_name?: string;
        username?: string;
        photo_url?: string;
        is_premium?: boolean;
        language_code?: string;
        allows_write_to_pm?: boolean;
      };
      auth_date?: number;
      hash?: string;
      start_param?: string;
      can_send_after?: number;
      chat_instance?: string;
      chat_type?: string;
      query_id?: string;
    };
    platform?: string;
    colorScheme?: string;
    themeParams: {
      bg_color?: string;
      text_color?: string;
      hint_color?: string;
      link_color?: string;
      button_color?: string;
      button_text_color?: string;
      secondary_bg_color?: string;
    };
    isExpanded?: boolean;
    viewportHeight?: number;
    viewportStableHeight?: number;
    MainButton?: {
      text: string;
      color: string;
      textColor: string;
      isVisible: boolean;
      isActive: boolean;
      isProgressVisible: boolean;
      setText: (text: string) => void;
      setParams: (params: { color?: string; text_color?: string; text?: string }) => void;
      show: () => void;
      hide: () => void;
      enable: () => void;
      disable: () => void;
      showProgress: (leaveText?: boolean) => void;
      hideProgress: () => void;
      onClick: (callback: () => void) => void;
      offClick: (callback: () => void) => void;
    };
    BackButton?: {
      isVisible: boolean;
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
      offClick: (callback: () => void) => void;
    };
    hapticFeedback?: {
      impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
      notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
      selectionChanged: () => void;
    };
    setHeaderColor: (color: string) => void;
    setBackgroundColor: (color: string) => void;
    expand: () => void;
    close: () => void;
    enableClosingConfirmation: () => void;
    disableClosingConfirmation: () => void;
    onEvent: (eventType: string, callback: Function) => void;
    offEvent: (eventType: string, callback: Function) => void;
    showPopup: (params: {
      title?: string;
      message: string;
      buttons?: Array<{
        id?: string;
        type: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
        text: string;
      }>;
    }) => Promise<{ button_id: string }>;
    isClosingConfirmationEnabled?: boolean;
  }
  
  export interface TelegramThemeParams {
    backgroundColor: string;
    textColor: string;
    buttonColor: string;
    buttonTextColor: string;
    hintColor: string;
    linkColor?: string;
    secondaryBackgroundColor: string;
  }
  
  export interface TelegramAuthData {
    user: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      photo_url?: string;
      is_premium?: boolean;
      language_code?: string;
    };
    hash: string;
    auth_date: number;
  }

  export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
      allows_write_to_pm?: boolean;
      photo_url?: string;
    };
    chat_instance?: string;
    chat_type?: string;
    auth_date?: number;
    hash?: string;
  };
  themeParams: {
    bg_color?: string;
    text_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    hint_color?: string;
    // Добавь другие параметры темы, если нужно
  };
  ready: () => void;
  close: () => void;
  expand: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  showPopup: (params: { message: string; buttons: Array<{ type: 'ok' | 'cancel'; text?: string }> }) => Promise<{ button_id: string }>;
  BackButton?: {
    hide: () => void;
  };
  MainButton?: {
    hide: () => void;
  };
  hapticFeedback?: {
    notificationOccurred: (type: string) => void;
  };
}