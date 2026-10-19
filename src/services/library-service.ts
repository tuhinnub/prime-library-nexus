import type {
  AdminMetrics,
  AppNotification,
  AppRole,
  Book,
  BookFilters,
  BorrowRecord,
  Category,
  Fine,
  LibrarySettings,
  Profile,
  Reservation,
  ReservationStatus,
  StaffFine,
  StaffReservation,
  ManagementAccess, Member, BookEdit, Copy, AuditEntry,
} from "@/types/library";

/**
 * Transport-agnostic contract for all library business operations.
 * The UI only talks to this interface. Today it is backed by Lovable Cloud
 * (see cloud-library-service.ts); a future adapter can forward the same calls
 * to the existing C++ core over HTTP without touching any page.
 */
export interface LibraryService {
  listCategories(): Promise<Category[]>;
  listBooks(filters?: BookFilters): Promise<Book[]>;
  getBook(id: string): Promise<Book | null>;
  listAuthors(): Promise<string[]>;
  getSettings(): Promise<LibrarySettings>;

  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, patch: Partial<Omit<Profile, "id" | "email">>): Promise<void>;
  getRoles(userId: string): Promise<AppRole[]>;

  listFavoriteIds(userId: string): Promise<string[]>;
  listFavorites(userId: string): Promise<Book[]>;
  addFavorite(userId: string, bookId: string): Promise<void>;
  removeFavorite(userId: string, bookId: string): Promise<void>;

  listReservations(userId: string): Promise<Reservation[]>;
  reserveBook(bookId: string): Promise<string>;
  cancelReservation(reservationId: string): Promise<void>;

  listBorrowRecords(userId: string): Promise<BorrowRecord[]>;
  listFines(userId: string): Promise<Fine[]>;

  listNotifications(userId: string): Promise<AppNotification[]>;
  markNotificationsRead(ids?: string[]): Promise<void>;

  adminMetrics(): Promise<AdminMetrics>;
  staffPendingReservations(): Promise<StaffReservation[]>;
  staffSetReservation(id: string, status: ReservationStatus): Promise<void>;
  staffCheckout(email: string, barcode: string): Promise<void>;
  staffReturn(barcode: string): Promise<{ overdue_days: number; fine: number }>;
  staffUnpaidFines(): Promise<StaffFine[]>;
  staffMarkFinePaid(id: string): Promise<void>;
  updateSettings(s: Partial<LibrarySettings>): Promise<void>;
  managementAccess(): Promise<ManagementAccess>;
  managementMembers(): Promise<Member[]>;
  setMemberRole(userId: string, role: AppRole): Promise<void>;
  saveBook(book: BookEdit): Promise<string>;
  listCopies(bookId: string): Promise<Copy[]>;
  addCopy(bookId: string, barcode: string, shelf: string): Promise<void>;
  auditLog(): Promise<AuditEntry[]>;
  saveCategory(name: string, slug: string): Promise<void>;
  saveAuthor(name: string): Promise<void>;
}
