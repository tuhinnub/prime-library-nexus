export type AppRole = "student" | "faculty" | "librarian" | "admin";
export type ReservationStatus =
  | "pending"
  | "approved"
  | "ready_for_pickup"
  | "cancelled"
  | "completed"
  | "expired";
export type BorrowStatus = "active" | "returned" | "lost";
export type DueState = "active" | "due_soon" | "overdue" | "returned";
export type FineStatus = "unpaid" | "paid" | "waived";
export type CategoryTone = "blue" | "lime" | "gray";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  tone: CategoryTone;
}

export interface Book {
  id: string;
  title: string;
  isbn: string;
  publisher: string | null;
  department: string | null;
  language: string;
  publicationYear: number | null;
  description: string | null;
  coverUrl: string | null;
  rating: number;
  popularity: number;
  pages: number | null;
  featured: boolean;
  createdAt: string;
  category: Pick<Category, "id" | "name" | "slug" | "tone"> | null;
  authors: string[];
  totalCopies: number;
  availableCopies: number;
}

export type SortKey = "popular" | "recent" | "title" | "rating";

export interface BookFilters {
  q?: string;
  category?: string; // slug
  author?: string;
  language?: string;
  year?: number;
  availableOnly?: boolean;
  sort?: SortKey;
}

export interface Profile {
  id: string;
  fullName: string;
  email: string | null;
  universityId: string | null;
  department: string | null;
  semester: string | null;
  avatarUrl: string | null;
  language: string;
  notifyEmail: boolean;
  notifyDueDates: boolean;
}

export interface Reservation {
  id: string;
  status: ReservationStatus;
  reservedAt: string;
  expiresAt: string | null;
  book: Book;
}

export interface BorrowRecord {
  id: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  status: BorrowStatus;
  barcode: string;
  book: Book;
}

export interface Fine {
  id: string;
  amount: number;
  overdueDays: number;
  status: FineStatus;
  paidAt: string | null;
  borrow: Pick<BorrowRecord, "id" | "dueAt" | "returnedAt"> & { bookTitle: string };
}

export interface AppNotification {
  id: string;
  type: "reservation" | "availability" | "due_soon" | "overdue" | "announcement";
  title: string;
  message: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface LibrarySettings {
  loanDays: number;
  finePerDay: number;
  maxActiveReservations: number;
  currency: string;
}

export interface AdminMetrics {
  total_books: number;
  available_copies: number;
  borrowed: number;
  overdue: number;
  users: number;
  pending_reservations: number;
}

export interface StaffReservation {
  id: string;
  status: ReservationStatus;
  reservedAt: string;
  bookTitle: string;
  memberName: string;
  memberEmail: string | null;
}

export interface StaffFine {
  id: string;
  amount: number;
  overdueDays: number;
  memberEmail: string | null;
}
