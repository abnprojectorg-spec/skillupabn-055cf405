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
  videoSourceType: "youtube" | "custom";
  previewLink: string;
  embedCode: string;
  qrCodeUrl: string;
  howToPayVideoUrl: string;
  isFree: boolean;
  playlistId?: string;
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

export type VerificationStatus = "unverified" | "pending" | "verified_person" | "verified_business";

export interface FirestoreUser {
  user_id: string;
  full_name: string;
  email: string;
  courses_unlocked: string[];
  signup_date: unknown;
  profile_image: string | null;
  // Verification fields
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  telegram_username?: string;
  verification_status?: VerificationStatus;
  verification_requested?: boolean;
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

// ─── Ebook Interfaces ────────────────────────────────────────

export interface FirestoreEbook {
  id: string;
  title: string;
  author: string;
  description: string;
  shortDescription: string;
  price: number;
  isFree: boolean;
  coverImage: string;
  pdfUrl: string;
  qrCodeUrl: string;
  pages: number;
  whatYouWillLearn: string;
  createdAt?: unknown;
}

export interface EbookPaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  ebookId: string;
  ebookTitle: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;
}

export interface EbookPurchase {
  id: string;
  userId: string;
  ebookId: string;
  purchasedAt: unknown;
}

// ─── Ebook Hooks ─────────────────────────────────────────────

export function useEbooks() {
  const [ebooks, setEbooks] = useState<FirestoreEbook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "ebooks"), (snap) => {
      setEbooks(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreEbook)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { ebooks, loading };
}

export function useEbook(id: string | undefined) {
  const [ebook, setEbook] = useState<FirestoreEbook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "ebooks", id), (snap) => {
      setEbook(snap.exists() ? { id: snap.id, ...snap.data() } as FirestoreEbook : null);
      setLoading(false);
    }, (error) => { console.error("Error fetching ebook:", error); setLoading(false); });
    return unsub;
  }, [id]);

  return { ebook, loading };
}

export function useEbookPaymentRequests() {
  const [requests, setRequests] = useState<EbookPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "ebook_payment_requests"), orderBy("createdAt", "desc")),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EbookPaymentRequest)));
        setLoading(false);
      },
      (error) => { console.error("Ebook payment requests error:", error); setLoading(false); }
    );
    return unsub;
  }, []);

  return { requests, loading };
}

export function useUserEbookPayments(userId: string | undefined) {
  const [payments, setPayments] = useState<EbookPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "ebook_payment_requests"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EbookPaymentRequest)));
      setLoading(false);
    }, (error) => { console.error("User ebook payments error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { payments, loading };
}

export function useUserEbookPurchases(userId: string | undefined) {
  const [purchases, setPurchases] = useState<EbookPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "ebook_purchases"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setPurchases(snap.docs.map((d) => ({ id: d.id, ...d.data() } as EbookPurchase)));
      setLoading(false);
    }, (error) => { console.error("Ebook purchases error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { purchases, loading };
}

// ─── Ebook CRUD ──────────────────────────────────────────────

export async function addEbook(ebook: Omit<FirestoreEbook, "id">) {
  return addDoc(collection(db, "ebooks"), { ...ebook, createdAt: serverTimestamp() });
}

export async function updateEbook(id: string, data: Partial<FirestoreEbook>) {
  return updateDoc(doc(db, "ebooks", id), data);
}

export async function deleteEbook(id: string) {
  return deleteDoc(doc(db, "ebooks", id));
}

// ─── Ebook Payment CRUD ─────────────────────────────────────

export async function submitEbookPaymentRequest(data: {
  userId: string; userEmail: string; userName: string;
  ebookId: string; ebookTitle: string; transactionId: string;
}) {
  return addDoc(collection(db, "ebook_payment_requests"), { ...data, status: "pending", createdAt: serverTimestamp() });
}

export async function approveEbookPayment(requestId: string, userId: string, ebookId: string) {
  await updateDoc(doc(db, "ebook_payment_requests", requestId), { status: "approved" });
  await addDoc(collection(db, "ebook_purchases"), { userId, ebookId, purchasedAt: serverTimestamp() });
}

export async function rejectEbookPayment(requestId: string) {
  await updateDoc(doc(db, "ebook_payment_requests", requestId), { status: "rejected" });
}

export async function deleteEbookPaymentRequest(requestId: string) {
  return deleteDoc(doc(db, "ebook_payment_requests", requestId));
}

export async function hasEbookAccess(userId: string, ebookId: string): Promise<boolean> {
  const q = query(collection(db, "ebook_purchases"), where("userId", "==", userId), where("ebookId", "==", ebookId));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── Digital File Interfaces ─────────────────────────────────

export interface FirestoreDigitalFile {
  id: string;
  title: string;
  developer: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  isFree: boolean;
  coverImage: string;
  fileUrl: string;
  qrCodeUrl: string;
  fileType: string;
  fileSize: string;
  whatYouWillGet: string;
  createdAt?: unknown;
}

export interface FilePaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  fileId: string;
  fileTitle: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;
}

export interface FilePurchase {
  id: string;
  userId: string;
  fileId: string;
  purchasedAt: unknown;
}

// ─── Digital File Hooks ──────────────────────────────────────

export function useDigitalFiles() {
  const [files, setFiles] = useState<FirestoreDigitalFile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "digital_files"), (snap) => {
      setFiles(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreDigitalFile)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { files, loading };
}

export function useDigitalFile(id: string | undefined) {
  const [file, setFile] = useState<FirestoreDigitalFile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "digital_files", id), (snap) => {
      setFile(snap.exists() ? { id: snap.id, ...snap.data() } as FirestoreDigitalFile : null);
      setLoading(false);
    }, (error) => { console.error("Error fetching file:", error); setLoading(false); });
    return unsub;
  }, [id]);

  return { file, loading };
}

export function useFilePaymentRequests() {
  const [requests, setRequests] = useState<FilePaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "file_payment_requests"), orderBy("createdAt", "desc")),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FilePaymentRequest)));
        setLoading(false);
      },
      (error) => { console.error("File payment requests error:", error); setLoading(false); }
    );
    return unsub;
  }, []);

  return { requests, loading };
}

export function useUserFilePayments(userId: string | undefined) {
  const [payments, setPayments] = useState<FilePaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "file_payment_requests"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FilePaymentRequest)));
      setLoading(false);
    }, (error) => { console.error("User file payments error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { payments, loading };
}

export function useUserFilePurchases(userId: string | undefined) {
  const [purchases, setPurchases] = useState<FilePurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "file_purchases"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setPurchases(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FilePurchase)));
      setLoading(false);
    }, (error) => { console.error("File purchases error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { purchases, loading };
}

// ─── Digital File CRUD ───────────────────────────────────────

export async function addDigitalFile(file: Omit<FirestoreDigitalFile, "id">) {
  return addDoc(collection(db, "digital_files"), { ...file, createdAt: serverTimestamp() });
}

export async function updateDigitalFile(id: string, data: Partial<FirestoreDigitalFile>) {
  return updateDoc(doc(db, "digital_files", id), data);
}

export async function deleteDigitalFile(id: string) {
  return deleteDoc(doc(db, "digital_files", id));
}

// ─── Digital File Payment CRUD ───────────────────────────────

export async function submitFilePaymentRequest(data: {
  userId: string; userEmail: string; userName: string;
  fileId: string; fileTitle: string; transactionId: string;
}) {
  return addDoc(collection(db, "file_payment_requests"), { ...data, status: "pending", createdAt: serverTimestamp() });
}

export async function approveFilePayment(requestId: string, userId: string, fileId: string) {
  await updateDoc(doc(db, "file_payment_requests", requestId), { status: "approved" });
  await addDoc(collection(db, "file_purchases"), { userId, fileId, purchasedAt: serverTimestamp() });
}

export async function rejectFilePayment(requestId: string) {
  await updateDoc(doc(db, "file_payment_requests", requestId), { status: "rejected" });
}

export async function deleteFilePaymentRequest(requestId: string) {
  return deleteDoc(doc(db, "file_payment_requests", requestId));
}

export async function hasFileAccess(userId: string, fileId: string): Promise<boolean> {
  const q = query(collection(db, "file_purchases"), where("userId", "==", userId), where("fileId", "==", fileId));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── User CRUD (Admin) ───────────────────────────────────────

export async function updateUser(userId: string, data: Partial<FirestoreUser>) {
  return updateDoc(doc(db, "users", userId), data);
}

export async function deleteUser(userId: string) {
  // Delete enrollments
  const enrollQ = query(collection(db, "enrollments"), where("userId", "==", userId));
  const enrollSnap = await getDocs(enrollQ);
  for (const d of enrollSnap.docs) await deleteDoc(d.ref);
  // Delete payment requests
  const payQ = query(collection(db, "payment_requests"), where("userId", "==", userId));
  const paySnap = await getDocs(payQ);
  for (const d of paySnap.docs) await deleteDoc(d.ref);
  // Delete ebook purchases & payments
  const ebookPayQ = query(collection(db, "ebook_payment_requests"), where("userId", "==", userId));
  const ebookPaySnap = await getDocs(ebookPayQ);
  for (const d of ebookPaySnap.docs) await deleteDoc(d.ref);
  const ebookPurchQ = query(collection(db, "ebook_purchases"), where("userId", "==", userId));
  const ebookPurchSnap = await getDocs(ebookPurchQ);
  for (const d of ebookPurchSnap.docs) await deleteDoc(d.ref);
  // Delete user doc
  return deleteDoc(doc(db, "users", userId));
}

export async function removeUserCourseAccess(userId: string, courseId: string) {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const data = userSnap.data() as FirestoreUser;
    const updated = (data.courses_unlocked || []).filter((id) => id !== courseId);
    await updateDoc(userRef, { courses_unlocked: updated });
  }
  // Remove enrollment
  const q = query(collection(db, "enrollments"), where("userId", "==", userId), where("courseId", "==", courseId));
  const snap = await getDocs(q);
  for (const d of snap.docs) await deleteDoc(d.ref);
}

// ─── Admin Check ─────────────────────────────────────────────

export async function checkIsAdmin(email: string): Promise<boolean> {
  const q = query(collection(db, "admins"), where("email", "==", email));
  const snap = await getDocs(q);
  return !snap.empty;
}

// ─── Course Completion Requests ──────────────────────────────

export interface CourseCompletionRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  courseId: string;
  courseTitle: string;
  status: "pending" | "project_assigned" | "certified";
  createdAt: unknown;
}

export function useCompletionRequests() {
  const [requests, setRequests] = useState<CourseCompletionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "course_completion_requests"), orderBy("createdAt", "desc")),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as CourseCompletionRequest)));
        setLoading(false);
      },
      (error) => { console.error("Completion requests error:", error); setLoading(false); }
    );
    return unsub;
  }, []);

  return { requests, loading };
}

export function useUserCompletionRequest(userId: string | undefined, courseId: string | undefined) {
  const [request, setRequest] = useState<CourseCompletionRequest | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || !courseId) { setLoading(false); return; }
    const q = query(
      collection(db, "course_completion_requests"),
      where("userId", "==", userId),
      where("courseId", "==", courseId)
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequest(snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() } as CourseCompletionRequest);
      setLoading(false);
    }, (error) => { console.error("User completion error:", error); setLoading(false); });
    return unsub;
  }, [userId, courseId]);

  return { request, loading };
}

export async function submitCompletionRequest(data: {
  userId: string; userEmail: string; userName: string;
  courseId: string; courseTitle: string;
}) {
  return addDoc(collection(db, "course_completion_requests"), {
    ...data, status: "pending", createdAt: serverTimestamp(),
  });
}

export async function updateCompletionStatus(requestId: string, status: CourseCompletionRequest["status"]) {
  return updateDoc(doc(db, "course_completion_requests", requestId), { status });
}

export async function deleteCompletionRequest(requestId: string) {
  return deleteDoc(doc(db, "course_completion_requests", requestId));
}

// ─── Admin Settings ──────────────────────────────────────────

export interface AdminSettings {
  adminTelegram: string;
  howToPayVideoUrl: string;
}

export function useAdminSettings() {
  const [settings, setSettings] = useState<AdminSettings>({ adminTelegram: "", howToPayVideoUrl: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "admin"), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as AdminSettings);
      }
      setLoading(false);
    }, (error) => { console.error("Admin settings error:", error); setLoading(false); });
    return unsub;
  }, []);

  return { settings, loading };
}

export async function saveAdminTelegram(username: string) {
  return setDoc(doc(db, "settings", "admin"), { adminTelegram: username }, { merge: true });
}

export async function saveAdminSettings(data: Partial<AdminSettings>) {
  return setDoc(doc(db, "settings", "admin"), data, { merge: true });
}

// ─── Playlists ───────────────────────────────────────────────

export interface FirestorePlaylist {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  price: number;
  isFree: boolean;
  courseIds: string[];
  qrCodeUrl: string;
  createdAt?: unknown;
}

export interface PlaylistPaymentRequest {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  playlistId: string;
  playlistTitle: string;
  transactionId: string;
  status: "pending" | "approved" | "rejected";
  createdAt: unknown;
}

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<FirestorePlaylist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "playlists"), (snap) => {
      setPlaylists(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestorePlaylist)));
      setLoading(false);
    });
    return unsub;
  }, []);

  return { playlists, loading };
}

export function usePlaylist(id: string | undefined) {
  const [playlist, setPlaylist] = useState<FirestorePlaylist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    const unsub = onSnapshot(doc(db, "playlists", id), (snap) => {
      setPlaylist(snap.exists() ? { id: snap.id, ...snap.data() } as FirestorePlaylist : null);
      setLoading(false);
    }, (error) => { console.error("Error fetching playlist:", error); setLoading(false); });
    return unsub;
  }, [id]);

  return { playlist, loading };
}

export async function addPlaylist(playlist: Omit<FirestorePlaylist, "id">) {
  return addDoc(collection(db, "playlists"), { ...playlist, createdAt: serverTimestamp() });
}

export async function updatePlaylist(id: string, data: Partial<FirestorePlaylist>) {
  return updateDoc(doc(db, "playlists", id), data);
}

export async function deletePlaylist(id: string) {
  return deleteDoc(doc(db, "playlists", id));
}

export function usePlaylistPaymentRequests() {
  const [requests, setRequests] = useState<PlaylistPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "playlist_payment_requests"), orderBy("createdAt", "desc")),
      (snap) => {
        setRequests(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PlaylistPaymentRequest)));
        setLoading(false);
      },
      (error) => { console.error("Playlist payment requests error:", error); setLoading(false); }
    );
    return unsub;
  }, []);

  return { requests, loading };
}

export function useUserPlaylistPayments(userId: string | undefined) {
  const [payments, setPayments] = useState<PlaylistPaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "playlist_payment_requests"), where("userId", "==", userId));
    const unsub = onSnapshot(q, (snap) => {
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() } as PlaylistPaymentRequest)));
      setLoading(false);
    }, (error) => { console.error("User playlist payments error:", error); setLoading(false); });
    return unsub;
  }, [userId]);

  return { payments, loading };
}

export async function submitPlaylistPaymentRequest(data: {
  userId: string; userEmail: string; userName: string;
  playlistId: string; playlistTitle: string; transactionId: string;
}) {
  return addDoc(collection(db, "playlist_payment_requests"), { ...data, status: "pending", createdAt: serverTimestamp() });
}

export async function approvePlaylistPayment(requestId: string, userId: string, playlistId: string) {
  await updateDoc(doc(db, "playlist_payment_requests", requestId), { status: "approved" });
  // Get the playlist to find all course IDs
  const playlistSnap = await getDoc(doc(db, "playlists", playlistId));
  if (playlistSnap.exists()) {
    const playlist = playlistSnap.data() as FirestorePlaylist;
    // Enroll user in all courses in the playlist
    for (const courseId of playlist.courseIds || []) {
      const alreadyEnrolled = await isEnrolled(userId, courseId);
      if (!alreadyEnrolled) {
        await enrollUser(userId, courseId);
      }
    }
  }
}

export async function rejectPlaylistPayment(requestId: string) {
  await updateDoc(doc(db, "playlist_payment_requests", requestId), { status: "rejected" });
}

export async function deletePlaylistPaymentRequest(requestId: string) {
  return deleteDoc(doc(db, "playlist_payment_requests", requestId));
}

export async function enrollFreePlaylist(userId: string, playlistId: string) {
  const playlistSnap = await getDoc(doc(db, "playlists", playlistId));
  if (playlistSnap.exists()) {
    const playlist = playlistSnap.data() as FirestorePlaylist;
    for (const courseId of playlist.courseIds || []) {
      const alreadyEnrolled = await isEnrolled(userId, courseId);
      if (!alreadyEnrolled) {
        await enrollUser(userId, courseId);
      }
    }
  }
}

// ─── Collaborations ──────────────────────────────────────────

export interface FirestoreCollaboration {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  badgeUrl: string;
  platformType: string; // TikToker, YouTuber, Company, Influencer
  createdAt?: unknown;
}

export function useCollaborations() {
  const [collaborations, setCollaborations] = useState<FirestoreCollaboration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "collaborations"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCollaborations(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreCollaboration)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, []);

  return { collaborations, loading };
}

export async function addCollaboration(data: Omit<FirestoreCollaboration, "id">) {
  return addDoc(collection(db, "collaborations"), { ...data, createdAt: serverTimestamp() });
}

export async function updateCollaboration(id: string, data: Partial<FirestoreCollaboration>) {
  return updateDoc(doc(db, "collaborations", id), data);
}

export async function deleteCollaboration(id: string) {
  return deleteDoc(doc(db, "collaborations", id));
}

// ─── Referral Codes ──────────────────────────────────────────

export interface ReferralCode {
  id: string;
  code: string;
  productType: "course" | "ebook" | "file";
  productId: string;
  productTitle: string;
  discountPrice: number;
  referralQrCodeUrl: string;
  active: boolean;
  createdAt?: unknown;
}

export function useReferralCodes() {
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(
      query(collection(db, "referralCodes"), orderBy("createdAt", "desc")),
      (snap) => {
        setCodes(snap.docs.map((d) => ({ id: d.id, ...d.data() } as ReferralCode)));
        setLoading(false);
      },
      () => setLoading(false)
    );
    return unsub;
  }, []);

  return { codes, loading };
}

export async function validateReferralCode(
  code: string,
  productType: "course" | "ebook" | "file",
  productId: string
): Promise<ReferralCode | null> {
  const q = query(
    collection(db, "referralCodes"),
    where("code", "==", code.toUpperCase().trim()),
    where("productType", "==", productType),
    where("productId", "==", productId),
    where("active", "==", true)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as ReferralCode;
}

export async function addReferralCode(data: Omit<ReferralCode, "id">) {
  return addDoc(collection(db, "referralCodes"), { ...data, createdAt: serverTimestamp() });
}

export async function updateReferralCode(id: string, data: Partial<ReferralCode>) {
  return updateDoc(doc(db, "referralCodes", id), data);
}

export async function deleteReferralCode(id: string) {
  return deleteDoc(doc(db, "referralCodes", id));
}

// ─── Notifications ───────────────────────────────────────────

export interface FirestoreNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "payment_approved" | "course_unlocked" | "new_course" | "general";
  read: boolean;
  createdAt?: unknown;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<FirestoreNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }
    const q = query(collection(db, "notifications"), where("userId", "==", userId), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setNotifications(snap.docs.map((d) => ({ id: d.id, ...d.data() } as FirestoreNotification)));
      setLoading(false);
    }, () => setLoading(false));
    return unsub;
  }, [userId]);

  return { notifications, loading };
}

export async function addNotification(data: Omit<FirestoreNotification, "id">) {
  return addDoc(collection(db, "notifications"), { ...data, createdAt: serverTimestamp() });
}

export async function markNotificationRead(id: string) {
  return updateDoc(doc(db, "notifications", id), { read: true });
}

export async function markAllNotificationsRead(userId: string) {
  const q = query(collection(db, "notifications"), where("userId", "==", userId), where("read", "==", false));
  const snap = await getDocs(q);
  const promises = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
  return Promise.all(promises);
}
