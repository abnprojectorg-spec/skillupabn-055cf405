import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export interface FirestoreCourse {
  id: string;
  title: string;
  instructor: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  thumbnail: string;
  videoUrl: string;
  qrCodeUrl: string;
  howToPayVideoUrl: string;
  rating: number;
  students: number;
  lessons: number;
  duration: string;
  createdAt?: unknown;
}

export interface FirestoreEnrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: unknown;
  progress: number;
}

export interface FirestoreUser {
  user_id: string;
  full_name: string;
  email: string;
  courses_unlocked: string[];
  signup_date: unknown;
  profile_image: string | null;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  screenshotURL: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;
}

// Real-time courses listener
export function useCourses() {
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCourse));
      setCourses(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  return { courses, loading };
}

// Fetch single course
export function useCourse(id: string | undefined) {
  const [course, setCourse] = useState<FirestoreCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    getDoc(doc(db, "courses", id)).then((snap) => {
      setCourse(snap.exists() ? { id: snap.id, ...snap.data() } as FirestoreCourse : null);
      setLoading(false);
    });
  }, [id]);

  return { course, loading };
}

// Enrollments for a user
export function useEnrollments(userId: string | undefined) {
  const [enrollments, setEnrollments] = useState<FirestoreEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "enrollments"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setEnrollments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreEnrollment)));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { enrollments, loading };
}

// All users (admin)
export function useUsers() {
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => d.data() as FirestoreUser));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { users, loading };
}

// Payment requests (admin - real-time)
export function usePaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "payment_requests"), orderBy("createdAt", "desc")),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRequest)));
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  return { requests, loading };
}

// User's own payment requests
export function useUserPayments(userId: string | undefined) {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "payment_requests"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRequest)));
      setLoading(false);
    });
    return unsub;
  }, [userId]);

  return { payments, loading };
}

// Add course
export async function addCourse(course: Omit<FirestoreCourse, "id">) {
  return addDoc(collection(db, "courses"), { ...course, createdAt: serverTimestamp() });
}

// Update course
export async function updateCourse(id: string, data: Partial<FirestoreCourse>) {
  return updateDoc(doc(db, "courses", id), data);
}

// Delete course
export async function deleteCourse(id: string) {
  return deleteDoc(doc(db, "courses", id));
}

// Enroll user
export async function enrollUser(userId: string, courseId: string) {
  // Add to enrollments collection
  await addDoc(collection(db, "enrollments"), {
    userId,
    courseId,
    enrolledAt: serverTimestamp(),
    progress: 0,
  });
  // Also update courses_unlocked on user doc
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    courses_unlocked: arrayUnion(courseId),
  });
}

// Check enrollment
export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const q = query(
    collection(db, "enrollments"),
    where("userId", "==", userId),
    where("courseId", "==", courseId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}

// Upload screenshot to Firebase Storage
export async function uploadPaymentScreenshot(file: File, userId: string): Promise<string> {
  const fileRef = ref(storage, `payment_screenshots/${userId}_${Date.now()}_${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

// Submit payment request
export async function submitPaymentRequest(data: {
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  screenshotURL: string;
  transactionId: string;
}) {
  return addDoc(collection(db, "payment_requests"), {
    ...data,
    status: "pending",
    createdAt: serverTimestamp(),
  });
}

// Approve payment (admin)
export async function approvePayment(requestId: string, userId: string, courseId: string) {
  await updateDoc(doc(db, "payment_requests", requestId), { status: "approved" });
  await enrollUser(userId, courseId);
}

// Reject payment (admin)
export async function rejectPayment(requestId: string) {
  await updateDoc(doc(db, "payment_requests", requestId), { status: "rejected" });
}

// Delete payment request (admin)
export async function deletePaymentRequest(requestId: string) {
  return deleteDoc(doc(db, "payment_requests", requestId));
}

// Check if user is admin (checks admins collection)
export async function checkIsAdmin(email: string): Promise<boolean> {
  const q = query(collection(db, "admins"), where("email", "==", email));
  const snap = await getDocs(q);
  return !snap.empty;
}
