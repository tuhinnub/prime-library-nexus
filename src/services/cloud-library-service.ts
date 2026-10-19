import { supabase } from "@/integrations/supabase/client";
import type { LibraryService } from "./library-service";
import type {
  AdminMetrics,
  AppNotification,
  AppRole,
  Book,
  BorrowRecord,
  Category,
  Fine,
  Profile,
  Reservation,
  ManagementAccess, Member, AuditEntry,
} from "@/types/library";

const BOOK_SELECT =
  "id,title,isbn,publisher,department,language,publication_year,description,cover_url,rating,popularity,pages,featured,created_at,category:categories(id,name,slug,tone),book_authors(position,author:authors(name))";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = any;

function fail(error: { message: string } | null): asserts error is null {
  if (error) throw new Error(error.message);
}

function mapBook(r: Row, avail?: Map<string, { total: number; available: number }>): Book {
  const a = avail?.get(r.id);
  return {
    id: r.id,
    title: r.title,
    isbn: r.isbn,
    publisher: r.publisher,
    department: r.department,
    language: r.language,
    publicationYear: r.publication_year,
    description: r.description,
    coverUrl: r.cover_url,
    rating: Number(r.rating ?? 0),
    popularity: r.popularity ?? 0,
    pages: r.pages,
    featured: !!r.featured,
    createdAt: r.created_at,
    category: r.category ?? null,
    authors: ((r.book_authors ?? []) as Row[])
      .sort((x, y) => x.position - y.position)
      .map((x) => x.author?.name)
      .filter(Boolean),
    totalCopies: a?.total ?? 0,
    availableCopies: a?.available ?? 0,
  };
}

async function availability(ids: string[]) {
  const map = new Map<string, { total: number; available: number }>();
  if (!ids.length) return map;
  const { data, error } = await supabase.rpc("get_book_availability", { _book_ids: ids });
  fail(error);
  for (const r of data ?? []) map.set(r.book_id, { total: r.total_copies, available: r.available_copies });
  return map;
}

async function withAvailability(rows: Row[]): Promise<Book[]> {
  const map = await availability(rows.map((r) => r.id));
  return rows.map((r) => mapBook(r, map));
}

const sanitize = (s: string) => s.replace(/[%,()*]/g, " ").trim();

export const cloudLibraryService: LibraryService = {
  async listCategories() {
    const { data, error } = await supabase.from("categories").select("id,name,slug,description,tone").order("sort_order");
    fail(error);
    return (data ?? []) as Category[];
  },

  async listBooks(f = {}) {
    let q = supabase.from("books").select(BOOK_SELECT);
    if (f.category) {
      const { data: cat } = await supabase.from("categories").select("id").eq("slug", f.category).maybeSingle();
      if (!cat) return [];
      q = q.eq("category_id", cat.id);
    }
    if (f.language) q = q.eq("language", f.language);
    if (f.year) q = q.eq("publication_year", f.year);
    switch (f.sort) {
      case "recent": q = q.order("created_at", { ascending: false }); break;
      case "title": q = q.order("title"); break;
      case "rating": q = q.order("rating", { ascending: false }); break;
      default: q = q.order("popularity", { ascending: false });
    }
    const { data, error } = await q.limit(200);
    fail(error);
    let books = await withAvailability(data ?? []);
    const term = f.q ? sanitize(f.q).toLowerCase() : "";
    if (term) {
      books = books.filter((b) =>
        [b.title, b.isbn, b.department ?? "", b.category?.name ?? "", ...b.authors]
          .join(" ")
          .toLowerCase()
          .includes(term),
      );
    }
    if (f.author) books = books.filter((b) => b.authors.includes(f.author!));
    if (f.availableOnly) books = books.filter((b) => b.availableCopies > 0);
    return books;
  },

  async getBook(id) {
    const { data, error } = await supabase.from("books").select(BOOK_SELECT).eq("id", id).maybeSingle();
    fail(error);
    if (!data) return null;
    return (await withAvailability([data]))[0];
  },

  async listAuthors() {
    const { data, error } = await supabase.from("authors").select("name").order("name");
    fail(error);
    return (data ?? []).map((a) => a.name);
  },

  async getSettings() {
    const { data, error } = await supabase.from("library_settings").select("*").eq("id", 1).single();
    fail(error);
    return {
      loanDays: data.loan_days,
      finePerDay: Number(data.fine_per_day),
      maxActiveReservations: data.max_active_reservations,
      currency: data.currency,
    };
  },

  async getProfile(userId) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    fail(error);
    if (!data) return null;
    return {
      id: data.id,
      fullName: data.full_name,
      email: data.email,
      universityId: data.university_id,
      department: data.department,
      semester: data.semester,
      avatarUrl: data.avatar_url,
      language: data.language,
      notifyEmail: data.notify_email,
      notifyDueDates: data.notify_due_dates,
    } satisfies Profile;
  },

  async updateProfile(userId, p) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const patch: any = {};
    if (p.fullName !== undefined) patch.full_name = p.fullName;
    if (p.universityId !== undefined) patch.university_id = p.universityId || null;
    if (p.department !== undefined) patch.department = p.department || null;
    if (p.semester !== undefined) patch.semester = p.semester || null;
    if (p.avatarUrl !== undefined) patch.avatar_url = p.avatarUrl;
    if (p.language !== undefined) patch.language = p.language;
    if (p.notifyEmail !== undefined) patch.notify_email = p.notifyEmail;
    if (p.notifyDueDates !== undefined) patch.notify_due_dates = p.notifyDueDates;
    const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
    fail(error);
  },

  async getRoles(userId) {
    const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    fail(error);
    return (data ?? []).map((r) => r.role as AppRole);
  },

  async listFavoriteIds(userId) {
    const { data, error } = await supabase.from("favorites").select("book_id").eq("user_id", userId);
    fail(error);
    return (data ?? []).map((r) => r.book_id);
  },

  async listFavorites(userId) {
    const { data, error } = await supabase
      .from("favorites")
      .select(`created_at, book:books(${BOOK_SELECT})`)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    fail(error);
    return withAvailability((data ?? []).map((r: Row) => r.book).filter(Boolean));
  },

  async addFavorite(userId, bookId) {
    const { error } = await supabase.from("favorites").insert({ user_id: userId, book_id: bookId });
    if (error && error.code !== "23505") throw new Error(error.message);
  },

  async removeFavorite(userId, bookId) {
    const { error } = await supabase.from("favorites").delete().eq("user_id", userId).eq("book_id", bookId);
    fail(error);
  },

  async listReservations(userId) {
    const { data, error } = await supabase
      .from("reservations")
      .select(`id,status,reserved_at,expires_at, book:books(${BOOK_SELECT})`)
      .eq("user_id", userId)
      .order("reserved_at", { ascending: false });
    fail(error);
    const rows = data ?? [];
    const books = await withAvailability(rows.map((r: Row) => r.book));
    return rows.map((r: Row, i) => ({
      id: r.id,
      status: r.status,
      reservedAt: r.reserved_at,
      expiresAt: r.expires_at,
      book: books[i],
    })) as Reservation[];
  },

  async reserveBook(bookId) {
    const { data, error } = await supabase.rpc("reserve_book", { _book_id: bookId });
    fail(error);
    return data as string;
  },

  async cancelReservation(id) {
    const { error } = await supabase.rpc("cancel_reservation", { _reservation_id: id });
    fail(error);
  },

  async listBorrowRecords(userId) {
    const { data, error } = await supabase
      .from("borrow_records")
      .select(`id,borrowed_at,due_at,returned_at,status, copy:book_copies(barcode, book:books(${BOOK_SELECT}))`)
      .eq("user_id", userId)
      .order("borrowed_at", { ascending: false });
    fail(error);
    const rows = data ?? [];
    const books = await withAvailability(rows.map((r: Row) => r.copy.book));
    return rows.map((r: Row, i) => ({
      id: r.id,
      borrowedAt: r.borrowed_at,
      dueAt: r.due_at,
      returnedAt: r.returned_at,
      status: r.status,
      barcode: r.copy.barcode,
      book: books[i],
    })) as BorrowRecord[];
  },

  async listFines(userId) {
    const { data, error } = await supabase
      .from("fines")
      .select("id,amount,overdue_days,status,paid_at, borrow:borrow_records(id,due_at,returned_at, copy:book_copies(book:books(title)))")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    fail(error);
    return (data ?? []).map((r: Row) => ({
      id: r.id,
      amount: Number(r.amount),
      overdueDays: r.overdue_days,
      status: r.status,
      paidAt: r.paid_at,
      borrow: {
        id: r.borrow.id,
        dueAt: r.borrow.due_at,
        returnedAt: r.borrow.returned_at,
        bookTitle: r.borrow.copy?.book?.title ?? "Unknown book",
      },
    })) as Fine[];
  },

  async listNotifications(userId) {
    const { data, error } = await supabase
      .from("notifications")
      .select("id,type,title,message,link,read_at,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    fail(error);
    return (data ?? []).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      link: n.link,
      readAt: n.read_at,
      createdAt: n.created_at,
    })) as AppNotification[];
  },

  async markNotificationsRead(ids) {
    const { error } = await supabase.rpc("mark_notifications_read", { _ids: ids ?? undefined });
    fail(error);
  },

  async adminMetrics() {
    const { data, error } = await supabase.rpc("admin_metrics");
    fail(error);
    return data as unknown as AdminMetrics;
  },

  async staffPendingReservations() {
    const { data, error } = await supabase
      .from("reservations")
      .select("id,status,reserved_at,user_id, book:books(title)")
      .in("status", ["pending", "approved", "ready_for_pickup"])
      .order("reserved_at");
    fail(error);
    const ids = [...new Set((data ?? []).map((r) => r.user_id))];
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("id,full_name,email").in("id", ids)
      : { data: [] as Row[] };
    const pm = new Map((profs ?? []).map((p: Row) => [p.id, p]));
    return (data ?? []).map((r: Row) => ({
      id: r.id,
      status: r.status,
      reservedAt: r.reserved_at,
      bookTitle: r.book?.title ?? "—",
      memberName: pm.get(r.user_id)?.full_name ?? "",
      memberEmail: pm.get(r.user_id)?.email ?? null,
    }));
  },

  async staffSetReservation(id, status) {
    const { error } = await supabase.rpc("staff_set_reservation", { _id: id, _status: status });
    fail(error);
  },

  async staffCheckout(email, barcode) {
    const { error } = await supabase.rpc("staff_checkout", { _email: email, _barcode: barcode });
    fail(error);
  },

  async staffReturn(barcode) {
    const { data, error } = await supabase.rpc("staff_return", { _barcode: barcode });
    fail(error);
    return data as unknown as { overdue_days: number; fine: number };
  },

  async staffUnpaidFines() {
    const { data, error } = await supabase.from("fines").select("id,amount,overdue_days,user_id").eq("status", "unpaid");
    fail(error);
    const ids = [...new Set((data ?? []).map((r) => r.user_id))];
    const { data: profs } = ids.length ? await supabase.from("profiles").select("id,email").in("id", ids) : { data: [] as Row[] };
    const pm = new Map((profs ?? []).map((p: Row) => [p.id, p.email]));
    return (data ?? []).map((f) => ({ id: f.id, amount: Number(f.amount), overdueDays: f.overdue_days, memberEmail: pm.get(f.user_id) ?? null }));
  },

  async staffMarkFinePaid(id) {
    const { error } = await supabase.rpc("staff_mark_fine_paid", { _id: id });
    fail(error);
  },

  async updateSettings(s) {
    const current = await this.getSettings();
    const { error } = await supabase.rpc("management_update_settings", { _loan_days: s.loanDays ?? current.loanDays, _fine_per_day: s.finePerDay ?? current.finePerDay, _max_holds: s.maxActiveReservations ?? current.maxActiveReservations });
    fail(error);
  },
  async managementAccess() {
    const { data, error } = await supabase.rpc("management_access"); fail(error);
    return data as unknown as ManagementAccess;
  },
  async managementMembers() {
    const { data, error } = await supabase.rpc("management_members"); fail(error);
    return data as unknown as Member[];
  },
  async setMemberRole(userId, role) {
    const { error } = await supabase.rpc("super_admin_set_role", { _user_id: userId, _role: role }); fail(error);
  },
  async saveBook(book) {
    const { data, error } = await supabase.rpc("management_save_book", { _book: { ...book } }); fail(error); return data as string;
  },
  async listCopies(bookId) {
    const { data, error } = await supabase.from("book_copies").select("id,barcode,shelf_location,status,book_id").eq("book_id", bookId).order("barcode"); fail(error); return data ?? [];
  },
  async addCopy(bookId, barcode, shelf) {
    const { error } = await supabase.rpc("management_save_copy", { _book_id: bookId, _barcode: barcode, _shelf: shelf }); fail(error);
  },
  async auditLog() {
    const { data, error } = await supabase.from("admin_audit_log").select("id,actor_id,action,entity,entity_id,created_at").order("created_at", { ascending: false }).limit(100); fail(error); return data as AuditEntry[];
  },
  async saveCategory(name, slug) { const { error } = await supabase.from("categories").insert({ name: name.trim(), slug: slug.trim(), tone: "blue" }); fail(error); },
  async saveAuthor(name) { const { error } = await supabase.from("authors").insert({ name: name.trim() }); fail(error); },
};
