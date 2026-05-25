import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export interface AppConfig {
  packageName: string;
  displayName: string;
  iconName: string;
  imageUri: string | null;
  opacity: number;
  blur: number;
  enabled: boolean;
}

export interface SchedulerConfig {
  enabled: boolean;
  intervalHours: number;
  cycleMode: "timer" | "album";
}

export interface Permissions {
  overlay: boolean;
  accessibility: boolean;
  storage: boolean;
}

interface OverlayContextType {
  serviceActive: boolean;
  setServiceActive: (v: boolean) => void;
  appConfigs: AppConfig[];
  updateAppConfig: (packageName: string, updates: Partial<AppConfig>) => void;
  schedulerConfig: SchedulerConfig;
  updateSchedulerConfig: (updates: Partial<SchedulerConfig>) => void;
  permissions: Permissions;
  setPermissionGranted: (key: keyof Permissions, value: boolean) => void;
  allPermissionsGranted: boolean;
  onboardingComplete: boolean;
  completeOnboarding: () => void;
}

const DEFAULT_APP_CONFIGS: AppConfig[] = [
  {
    packageName: "com.whatsapp",
    displayName: "WhatsApp",
    iconName: "message-circle",
    imageUri: null,
    opacity: 0.35,
    blur: 10,
    enabled: true,
  },
  {
    packageName: "com.facebook.orca",
    displayName: "Messenger",
    iconName: "send",
    imageUri: null,
    opacity: 0.35,
    blur: 10,
    enabled: true,
  },
  {
    packageName: "com.instagram.android",
    displayName: "Instagram",
    iconName: "instagram",
    imageUri: null,
    opacity: 0.35,
    blur: 12,
    enabled: false,
  },
  {
    packageName: "org.telegram.messenger",
    displayName: "Telegram",
    iconName: "navigation",
    imageUri: null,
    opacity: 0.3,
    blur: 8,
    enabled: false,
  },
  {
    packageName: "com.snapchat.android",
    displayName: "Snapchat",
    iconName: "aperture",
    imageUri: null,
    opacity: 0.4,
    blur: 14,
    enabled: false,
  },
];

const DEFAULT_SCHEDULER: SchedulerConfig = {
  enabled: false,
  intervalHours: 24,
  cycleMode: "timer",
};

const DEFAULT_PERMISSIONS: Permissions = {
  overlay: false,
  accessibility: false,
  storage: false,
};

const OverlayContext = createContext<OverlayContextType | null>(null);

const KEYS = {
  SERVICE_ACTIVE: "oc_service_active",
  APP_CONFIGS: "oc_app_configs",
  SCHEDULER: "oc_scheduler_config",
  PERMISSIONS: "oc_permissions",
  ONBOARDING: "oc_onboarding_complete",
};

export function OverlayProvider({ children }: { children: React.ReactNode }) {
  const [serviceActive, setServiceActiveState] = useState<boolean>(false);
  const [appConfigs, setAppConfigs] =
    useState<AppConfig[]>(DEFAULT_APP_CONFIGS);
  const [schedulerConfig, setSchedulerConfig] =
    useState<SchedulerConfig>(DEFAULT_SCHEDULER);
  const [permissions, setPermissions] =
    useState<Permissions>(DEFAULT_PERMISSIONS);
  const [onboardingComplete, setOnboardingComplete] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [svc, apps, sched, perms, onboard] = await Promise.all([
          AsyncStorage.getItem(KEYS.SERVICE_ACTIVE),
          AsyncStorage.getItem(KEYS.APP_CONFIGS),
          AsyncStorage.getItem(KEYS.SCHEDULER),
          AsyncStorage.getItem(KEYS.PERMISSIONS),
          AsyncStorage.getItem(KEYS.ONBOARDING),
        ]);
        if (svc !== null) setServiceActiveState(JSON.parse(svc));
        if (apps !== null) setAppConfigs(JSON.parse(apps));
        if (sched !== null) setSchedulerConfig(JSON.parse(sched));
        if (perms !== null) setPermissions(JSON.parse(perms));
        if (onboard !== null) setOnboardingComplete(JSON.parse(onboard));
      } catch {}
    };
    load();
  }, []);

  const setServiceActive = useCallback(async (v: boolean) => {
    setServiceActiveState(v);
    await AsyncStorage.setItem(KEYS.SERVICE_ACTIVE, JSON.stringify(v));
  }, []);

  const updateAppConfig = useCallback(
    async (packageName: string, updates: Partial<AppConfig>) => {
      setAppConfigs((prev) => {
        const next = prev.map((a) =>
          a.packageName === packageName ? { ...a, ...updates } : a,
        );
        AsyncStorage.setItem(KEYS.APP_CONFIGS, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const updateSchedulerConfig = useCallback(
    async (updates: Partial<SchedulerConfig>) => {
      setSchedulerConfig((prev) => {
        const next = { ...prev, ...updates };
        AsyncStorage.setItem(KEYS.SCHEDULER, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const setPermissionGranted = useCallback(
    async (key: keyof Permissions, value: boolean) => {
      setPermissions((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(KEYS.PERMISSIONS, JSON.stringify(next));
        return next;
      });
    },
    [],
  );

  const completeOnboarding = useCallback(async () => {
    setOnboardingComplete(true);
    await AsyncStorage.setItem(KEYS.ONBOARDING, JSON.stringify(true));
  }, []);

  const allPermissionsGranted =
    permissions.overlay && permissions.accessibility && permissions.storage;

  return (
    <OverlayContext.Provider
      value={{
        serviceActive,
        setServiceActive,
        appConfigs,
        updateAppConfig,
        schedulerConfig,
        updateSchedulerConfig,
        permissions,
        setPermissionGranted,
        allPermissionsGranted,
        onboardingComplete,
        completeOnboarding,
      }}
    >
      {children}
    </OverlayContext.Provider>
  );
}

export function useOverlay() {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error("useOverlay must be used inside OverlayProvider");
  return ctx;
}
