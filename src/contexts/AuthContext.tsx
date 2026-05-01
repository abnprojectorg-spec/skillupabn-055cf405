import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp, addDoc, collection } from "firebase/firestore";
import { auth, db, googleProvider } from "@/lib/firebase";
import { detectDevice } from "@/lib/deviceInfo";

interface UserProfile {
  user_id: string;
  full_name: string;
  email: string;
  courses_unlocked: string[];
  signup_date: unknown;
  profile_image: string | null;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  telegram_username?: string;
  verification_status?: "unverified" | "pending" | "verified_person" | "verified_business";
  verification_requested?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

async function createUserProfile(user: User, fullName?: string) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      user_id: user.uid,
      full_name: fullName || user.displayName || "",
      email: user.email || "",
      courses_unlocked: [],
      signup_date: serverTimestamp(),
      profile_image: user.photoURL || null,
    });
  }
}

async function fetchProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

async function recordLoginDevice(uid: string) {
  try {
    const device = await detectDevice();
    const payload = {
      userId: uid,
      device_type: device.type,
      device_model: device.model,
      os: device.os,
      os_version: device.osVersion,
      browser: device.browser,
      user_agent: device.userAgent,
      login_at: serverTimestamp(),
    };
    // Append history
    await addDoc(collection(db, "login_devices"), payload);
    // Latest snapshot on user profile
    await setDoc(
      doc(db, "users", uid),
      {
        last_device_type: device.type,
        last_device_model: device.model,
        last_login_os: device.os,
        last_login_browser: device.browser,
        last_login_at: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("Device tracking failed:", err);
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await fetchProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    recordLoginDevice(cred.user.uid);
  };

  const signup = async (email: string, password: string, fullName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await createUserProfile(cred.user, fullName);
    recordLoginDevice(cred.user.uid);
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    await createUserProfile(cred.user);
    recordLoginDevice(cred.user.uid);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
