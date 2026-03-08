import { useState, useEffect } from "react";
import {
  collection,
  query,
  getDocs,
  doc,
  getDoc,
  where,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

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
  return addDoc(collection(db, "enrollments"), {
    userId,
    courseId,
    enrolledAt: serverTimestamp(),
    progress: 0,
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
