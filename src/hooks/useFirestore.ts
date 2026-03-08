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
  setDoc,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

// ─── Interfaces ──────────────────────────────────────────────

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
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;
}

export interface FirestoreLesson {
  id: string;
  courseId: string;
  title: string;
  videoUrl: string;
  notes: string;
  order: number;
}

export interface FirestoreCourseProject {
  id: string;
  courseId: string;
  projectTitle: string;
  projectDescription: string;
}

// ─── Course Hooks ────────────────────────────────────────────

export function useCourses() {
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "courses"), (snap) => {
      setCourses(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCourse)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { courses, loading };
}

export function useCourse(id: string | undefined) {
  const [course, setCourse] = useState<FirestoreCourse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "courses", id), (snap) => {
      setCourse(snap.exists() ? { id: snap.id, ...snap.data() } as FirestoreCourse : null);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching course:", error);
      setLoading(false);
    });
    return unsub;
  }, [id]);

  return { course, loading };
}

// ─── Enrollment Hooks ────────────────────────────────────────

export function useEnrollments(userId: string | undefined) {
  const [enrollments, setEnrollments] = useState<FirestoreEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "enrollments"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setEnrollments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreEnrollment)));
      setLoading(false);
    }, (error) => { console.error("Enrollments error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { enrollments, loading };
}

// ─── User Hooks ──────────────────────────────────────────────

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

// ─── Payment Hooks ───────────────────────────────────────────

export function usePaymentRequests() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "payment_requests"), orderBy("createdAt", "desc")),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRequest)));
        setLoading(false);
      },
      (error) => { console.error("Payment requests error:", error); setLoading(false); }
    );
    return unsub;
  }, []);

  return { requests, loading };
}

export function useUserPayments(userId: string | undefined) {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "payment_requests"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PaymentRequest)));
      setLoading(false);
    }, (error) => { console.error("User payments error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { payments, loading };
}

// ─── Lesson Hooks ────────────────────────────────────────────

export function useLessons(courseId: string | undefined) {
  const [lessons, setLessons] = useState<FirestoreLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const q = query(collection(db, "lessons"), where("courseId", "==", courseId), orderBy("order", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setLessons(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreLesson)));
      setLoading(false);
    }, (error) => { console.error("Lessons error:", error); setLoading(false); });
    return unsub;
  }, [courseId]);

  return { lessons, loading };
}

export function useLessonProgress(userId: string | undefined, courseId: string | undefined) {
  const [completedLessonIds, setCompleted] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !courseId) { setLoading(false); return; }
    const q = query(
      collection(db, "lesson_progress"),
      where("userId", "==", userId),
      where("courseId", "==", courseId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setCompleted(new Set(snap.docs.map((d) => d.data().lessonId as string)));
      setLoading(false);
    }, (error) => { console.error("Lesson progress error:", error); setLoading(false); });
    return unsub;
  }, [userId, courseId]);

  return { completedLessonIds, loading };
}

// ─── Course Project Hook ─────────────────────────────────────

export function useCourseProject(courseId: string | undefined) {
  const [project, setProject] = useState<FirestoreCourseProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    const q = query(collection(db, "course_projects"), where("courseId", "==", courseId));
    const unsub = onSnapshot(q, (snap) => {
      if (!snap.empty) {
        const d = snap.docs[0];
        setProject({ id: d.id, ...d.data() } as FirestoreCourseProject);
      } else {
        setProject(null);
      }
      setLoading(false);
    }, (error) => { console.error("Course project error:", error); setLoading(false); });
    return unsub;
  }, [courseId]);

  return { project, loading };
}

// ─── Course CRUD ─────────────────────────────────────────────

export async function addCourse(course: Omit<FirestoreCourse, "id">) {
  return addDoc(collection(db, "courses"), { ...course, createdAt: serverTimestamp() });
}

export async function updateCourse(id: string, data: Partial<FirestoreCourse>) {
  return updateDoc(doc(db, "courses", id), data);
}

export async function deleteCourse(id: string) {
  return deleteDoc(doc(db, "courses", id));
}

// ─── Enrollment CRUD ─────────────────────────────────────────

export async function enrollUser(userId: string, courseId: string) {
  await addDoc(collection(db, "enrollments"), {
    userId, courseId, enrolledAt: serverTimestamp(), progress: 0,
  });
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { courses_unlocked: arrayUnion(courseId) });
}

export async function isEnrolled(userId: string, courseId: string): Promise<boolean> {
  const q = query(collection(db, "enrollments"), where("userId", "==", userId), where("courseId", "==", courseId));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── Payment CRUD ────────────────────────────────────────────

export async function submitPaymentRequest(data: {
  userId: string; userEmail: string; userName: string;
  courseId: string; courseTitle: string; transactionId: string;
}) {
  return addDoc(collection(db, "payment_requests"), { ...data, status: "pending", createdAt: serverTimestamp() });
}

export async function approvePayment(requestId: string, userId: string, courseId: string) {
  await updateDoc(doc(db, "payment_requests", requestId), { status: "approved" });
  await enrollUser(userId, courseId);
}

export async function rejectPayment(requestId: string) {
  await updateDoc(doc(db, "payment_requests", requestId), { status: "rejected" });
}

export async function deletePaymentRequest(requestId: string) {
  return deleteDoc(doc(db, "payment_requests", requestId));
}

// ─── Lesson CRUD (Admin) ────────────────────────────────────

export async function addLesson(lesson: Omit<FirestoreLesson, "id">) {
  return addDoc(collection(db, "lessons"), lesson);
}

export async function updateLesson(id: string, data: Partial<FirestoreLesson>) {
  return updateDoc(doc(db, "lessons", id), data);
}

export async function deleteLesson(id: string) {
  return deleteDoc(doc(db, "lessons", id));
}

// ─── Lesson Progress ─────────────────────────────────────────

export async function markLessonComplete(userId: string, courseId: string, lessonId: string) {
  const docId = `${userId}_${courseId}_${lessonId}`;
  await setDoc(doc(db, "lesson_progress", docId), {
    userId, courseId, lessonId, completedAt: serverTimestamp(),
  });
}

// ─── Course Project CRUD (Admin) ─────────────────────────────

export async function saveCourseProject(courseId: string, projectTitle: string, projectDescription: string, existingId?: string) {
  if (existingId) {
    return updateDoc(doc(db, "course_projects", existingId), { projectTitle, projectDescription });
  }
  return addDoc(collection(db, "course_projects"), { courseId, projectTitle, projectDescription });
}

export async function deleteCourseProject(id: string) {
  return deleteDoc(doc(db, "course_projects", id));
}

// ─── Community Links ─────────────────────────────────────────

export interface CommunityLink {
  id: string;
  category: string;
  url: string;
}

export function useCommunityLinks() {
  const [links, setLinks] = useState<CommunityLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "community_links"), (snap) => {
      setLinks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CommunityLink)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { links, loading };
}

export async function saveCommunityLink(category: string, url: string, existingId?: string) {
  if (existingId) {
    return updateDoc(doc(db, "community_links", existingId), { url });
  }
  return addDoc(collection(db, "community_links"), { category, url });
}

export async function deleteCommunityLink(id: string) {
  return deleteDoc(doc(db, "community_links", id));
}

// ─── Admin Check ─────────────────────────────────────────────

export async function checkIsAdmin(email: string): Promise<boolean> {
  const q = query(collection(db, "admins"), where("email", "==", email));
  const snap = await getDocs(q);
  return !snap.empty;
}
