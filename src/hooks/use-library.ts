import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { library } from "@/services";
import { useAuth } from "@/contexts/auth-context";
import type { BookFilters } from "@/types/library";

export const qk = {
  categories: ["categories"] as const,
  books: (f: BookFilters) => ["books", f] as const,
  book: (id: string) => ["book", id] as const,
  authors: ["authors"] as const,
  profile: (u?: string) => ["profile", u] as const,
  roles: (u?: string) => ["roles", u] as const,
  favIds: (u?: string) => ["favIds", u] as const,
  favorites: (u?: string) => ["favorites", u] as const,
  reservations: (u?: string) => ["reservations", u] as const,
  borrows: (u?: string) => ["borrows", u] as const,
  fines: (u?: string) => ["fines", u] as const,
  notifications: (u?: string) => ["notifications", u] as const,
  settings: ["settings"] as const,
};

export const useCategories = () => useQuery({ queryKey: qk.categories, queryFn: () => library.listCategories() });
export const useBooks = (f: BookFilters = {}) => useQuery({ queryKey: qk.books(f), queryFn: () => library.listBooks(f) });
export const useBook = (id: string) => useQuery({ queryKey: qk.book(id), queryFn: () => library.getBook(id) });
export const useAuthors = () => useQuery({ queryKey: qk.authors, queryFn: () => library.listAuthors() });
export const useSettings = () => useQuery({ queryKey: qk.settings, queryFn: () => library.getSettings() });

function useUid() {
  return useAuth().user?.id;
}

export function useProfile() {
  const uid = useUid();
  return useQuery({ queryKey: qk.profile(uid), queryFn: () => library.getProfile(uid!), enabled: !!uid });
}
export function useRoles() {
  const uid = useUid();
  return useQuery({ queryKey: qk.roles(uid), queryFn: () => library.getRoles(uid!), enabled: !!uid });
}
export function useReservations() {
  const uid = useUid();
  return useQuery({ queryKey: qk.reservations(uid), queryFn: () => library.listReservations(uid!), enabled: !!uid });
}
export function useBorrows() {
  const uid = useUid();
  return useQuery({ queryKey: qk.borrows(uid), queryFn: () => library.listBorrowRecords(uid!), enabled: !!uid });
}
export function useFines() {
  const uid = useUid();
  return useQuery({ queryKey: qk.fines(uid), queryFn: () => library.listFines(uid!), enabled: !!uid });
}
export function useNotifications() {
  const uid = useUid();
  return useQuery({ queryKey: qk.notifications(uid), queryFn: () => library.listNotifications(uid!), enabled: !!uid });
}
export function useFavorites() {
  const uid = useUid();
  return useQuery({ queryKey: qk.favorites(uid), queryFn: () => library.listFavorites(uid!), enabled: !!uid });
}
export function useFavoriteIds() {
  const uid = useUid();
  return useQuery({ queryKey: qk.favIds(uid), queryFn: () => library.listFavoriteIds(uid!), enabled: !!uid });
}

/** Optimistic toggle with rollback on failure. */
export function useToggleFavorite() {
  const uid = useUid();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ bookId, fav }: { bookId: string; fav: boolean }) => {
      if (!uid) throw new Error("Please sign in to save favorites.");
      return fav ? library.removeFavorite(uid, bookId) : library.addFavorite(uid, bookId);
    },
    onMutate: async ({ bookId, fav }) => {
      await qc.cancelQueries({ queryKey: qk.favIds(uid) });
      const prev = qc.getQueryData<string[]>(qk.favIds(uid));
      qc.setQueryData<string[]>(qk.favIds(uid), (old = []) =>
        fav ? old.filter((i) => i !== bookId) : [...old, bookId],
      );
      return { prev };
    },
    onError: (e, _v, ctx) => {
      qc.setQueryData(qk.favIds(uid), ctx?.prev);
      toast.error((e as Error).message);
    },
    onSuccess: (_d, { fav }) => toast.success(fav ? "Removed from favorites" : "Saved to favorites"),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk.favIds(uid) });
      qc.invalidateQueries({ queryKey: qk.favorites(uid) });
    },
  });
}

export function useReserveBook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bookId: string) => library.reserveBook(bookId),
    onSuccess: () => {
      toast.success("Reservation created", { description: "You'll be notified when it's ready for pickup." });
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["book"] });
      qc.invalidateQueries({ queryKey: ["books"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });
}

export function useCancelReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => library.cancelReservation(id),
    onSuccess: () => {
      toast.success("Reservation cancelled");
      qc.invalidateQueries({ queryKey: ["reservations"] });
      qc.invalidateQueries({ queryKey: ["book"] });
      qc.invalidateQueries({ queryKey: ["books"] });
    },
    onError: (e) => toast.error((e as Error).message),
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ids?: string[]) => library.markNotificationsRead(ids),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (e) => toast.error((e as Error).message),
  });
}
