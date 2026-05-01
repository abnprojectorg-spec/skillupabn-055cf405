// Device + model auto-detection (no user prompts).
// Combines UA-CH (when available) with classic UA parsing fallback.

export interface DeviceInfo {
  type: "mobile" | "tablet" | "desktop";
  os: string;
  osVersion: string;
  browser: string;
  model: string; // e.g. "TECNO BG6", "Samsung SM-A145F", "iPhone", "Desktop"
  userAgent: string;
}

interface UAData {
  mobile?: boolean;
  brands?: { brand: string; version: string }[];
  getHighEntropyValues?: (hints: string[]) => Promise<{
    model?: string;
    platform?: string;
    platformVersion?: string;
    architecture?: string;
  }>;
}

function getDeviceType(ua: string, mobile?: boolean): "mobile" | "tablet" | "desktop" {
  const isTablet = /iPad|Tablet|Nexus 7|Nexus 10|SM-T|GT-P/i.test(ua);
  if (isTablet) return "tablet";
  if (mobile === true) return "mobile";
  if (/Mobi|Android|iPhone|iPod|Windows Phone/i.test(ua)) return "mobile";
  return "desktop";
}

function getOS(ua: string): { os: string; version: string } {
  if (/Windows NT ([\d.]+)/.test(ua)) return { os: "Windows", version: RegExp.$1 };
  if (/Mac OS X ([\d_.]+)/.test(ua)) return { os: "macOS", version: RegExp.$1.replace(/_/g, ".") };
  if (/Android ([\d.]+)/.test(ua)) return { os: "Android", version: RegExp.$1 };
  if (/iPhone OS ([\d_]+)/.test(ua)) return { os: "iOS", version: RegExp.$1.replace(/_/g, ".") };
  if (/Linux/.test(ua)) return { os: "Linux", version: "" };
  return { os: "Unknown", version: "" };
}

function getBrowser(ua: string): string {
  if (/Edg\/([\d.]+)/.test(ua)) return `Edge ${RegExp.$1}`;
  if (/Chrome\/([\d.]+)/.test(ua) && !/Chromium/.test(ua)) return `Chrome ${RegExp.$1}`;
  if (/Firefox\/([\d.]+)/.test(ua)) return `Firefox ${RegExp.$1}`;
  if (/Safari\/([\d.]+)/.test(ua) && !/Chrome/.test(ua)) return `Safari`;
  if (/OPR\/([\d.]+)/.test(ua)) return `Opera ${RegExp.$1}`;
  return "Unknown";
}

function extractAndroidModel(ua: string): string | null {
  // "Linux; Android 13; TECNO BG6 Build/..."
  const m = ua.match(/Android[^;]*;\s*([^)]*?)(?:Build|;|\))/i);
  if (m) {
    const candidate = m[1].split(";").pop()?.trim();
    if (candidate && !/^Android/i.test(candidate)) return candidate;
  }
  return null;
}

export async function detectDevice(): Promise<DeviceInfo> {
  const nav = navigator as Navigator & { userAgentData?: UAData };
  const ua = navigator.userAgent || "";
  const uaData = nav.userAgentData;

  const type = getDeviceType(ua, uaData?.mobile);
  const { os, version: osVersion } = getOS(ua);
  const browser = getBrowser(ua);

  let model = extractAndroidModel(ua) || "";

  // Use high-entropy UA-CH for accurate model on Android (Chrome 90+)
  if (uaData?.getHighEntropyValues) {
    try {
      const hints = await uaData.getHighEntropyValues(["model", "platform", "platformVersion"]);
      if (hints.model) model = hints.model;
    } catch {
      /* ignore */
    }
  }

  if (!model) {
    if (/iPhone/.test(ua)) model = "iPhone";
    else if (/iPad/.test(ua)) model = "iPad";
    else if (type === "desktop") model = `${os} Desktop`;
    else model = "Unknown Device";
  }

  return {
    type,
    os,
    osVersion,
    browser,
    model: model.trim(),
    userAgent: ua,
  };
}
