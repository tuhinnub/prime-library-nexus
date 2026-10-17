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
}
