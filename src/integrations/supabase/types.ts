export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          details?: Json
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      authors: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      book_authors: {
        Row: {
          author_id: string
          book_id: string
          position: number
        }
        Insert: {
          author_id: string
          book_id: string
          position?: number
        }
        Update: {
          author_id?: string
          book_id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "book_authors_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "authors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "book_authors_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      book_copies: {
        Row: {
          barcode: string
          book_id: string
          created_at: string
          id: string
          shelf_location: string | null
          status: Database["public"]["Enums"]["copy_status"]
        }
        Insert: {
          barcode: string
          book_id: string
          created_at?: string
          id?: string
          shelf_location?: string | null
          status?: Database["public"]["Enums"]["copy_status"]
        }
        Update: {
          barcode?: string
          book_id?: string
          created_at?: string
          id?: string
          shelf_location?: string | null
          status?: Database["public"]["Enums"]["copy_status"]
        }
        Relationships: [
          {
            foreignKeyName: "book_copies_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          category_id: string | null
          cover_url: string | null
          created_at: string
          department: string | null
          description: string | null
          featured: boolean
          id: string
          isbn: string
          language: string
          pages: number | null
          popularity: number
          publication_year: number | null
          publisher: string | null
          rating: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          isbn: string
          language?: string
          pages?: number | null
          popularity?: number
          publication_year?: number | null
          publisher?: string | null
          rating?: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          department?: string | null
          description?: string | null
          featured?: boolean
          id?: string
          isbn?: string
          language?: string
          pages?: number | null
          popularity?: number
          publication_year?: number | null
          publisher?: string | null
          rating?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      borrow_records: {
        Row: {
          borrowed_at: string
          copy_id: string
          created_at: string
          due_at: string
          id: string
          returned_at: string | null
          status: Database["public"]["Enums"]["borrow_status"]
          user_id: string
        }
        Insert: {
          borrowed_at?: string
          copy_id: string
          created_at?: string
          due_at: string
          id?: string
          returned_at?: string | null
          status?: Database["public"]["Enums"]["borrow_status"]
          user_id: string
        }
        Update: {
          borrowed_at?: string
          copy_id?: string
          created_at?: string
          due_at?: string
          id?: string
          returned_at?: string | null
          status?: Database["public"]["Enums"]["borrow_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrow_records_copy_id_fkey"
            columns: ["copy_id"]
            isOneToOne: false
            referencedRelation: "book_copies"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
          sort_order: number
          tone: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
          sort_order?: number
          tone?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
          sort_order?: number
          tone?: string
        }
        Relationships: []
      }
      favorites: {
        Row: {
          book_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      fines: {
        Row: {
          amount: number
          borrow_record_id: string
          created_at: string
          id: string
          overdue_days: number
          paid_at: string | null
          status: Database["public"]["Enums"]["fine_status"]
          user_id: string
        }
        Insert: {
          amount: number
          borrow_record_id: string
          created_at?: string
          id?: string
          overdue_days: number
          paid_at?: string | null
          status?: Database["public"]["Enums"]["fine_status"]
          user_id: string
        }
        Update: {
          amount?: number
          borrow_record_id?: string
          created_at?: string
          id?: string
          overdue_days?: number
          paid_at?: string | null
          status?: Database["public"]["Enums"]["fine_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fines_borrow_record_id_fkey"
            columns: ["borrow_record_id"]
            isOneToOne: true
            referencedRelation: "borrow_records"
            referencedColumns: ["id"]
          },
        ]
      }
      library_settings: {
        Row: {
          currency: string
          fine_per_day: number
          id: number
          loan_days: number
          max_active_reservations: number
          reservation_hold_days: number
          updated_at: string
        }
        Insert: {
          currency?: string
          fine_per_day?: number
          id?: number
          loan_days?: number
          max_active_reservations?: number
          reservation_hold_days?: number
          updated_at?: string
        }
        Update: {
          currency?: string
          fine_per_day?: number
          id?: number
          loan_days?: number
          max_active_reservations?: number
          reservation_hold_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message: string
          read_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          email: string | null
          full_name: string
          id: string
          language: string
          notify_due_dates: boolean
          notify_email: boolean
          semester: string | null
          university_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id: string
          language?: string
          notify_due_dates?: boolean
          notify_email?: boolean
          semester?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          full_name?: string
          id?: string
          language?: string
          notify_due_dates?: boolean
          notify_email?: boolean
          semester?: string | null
          university_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          book_id: string
          expires_at: string | null
          id: string
          reserved_at: string
          status: Database["public"]["Enums"]["reservation_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id: string
          expires_at?: string | null
          id?: string
          reserved_at?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string
          expires_at?: string | null
          id?: string
          reserved_at?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_metrics: { Args: never; Returns: Json }
      cancel_reservation: {
        Args: { _reservation_id: string }
        Returns: undefined
      }
      get_book_availability: {
        Args: { _book_ids?: string[] }
        Returns: {
          available_copies: number
          book_id: string
          total_copies: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      management_access: { Args: never; Returns: Json }
      management_members: { Args: never; Returns: Json }
      management_save_book: { Args: { _book: Json }; Returns: string }
      management_save_copy: {
        Args: { _barcode: string; _book_id: string; _shelf: string }
        Returns: string
      }
      management_update_settings: {
        Args: { _fine_per_day: number; _loan_days: number; _max_holds: number }
        Returns: undefined
      }
      mark_notifications_read: { Args: { _ids?: string[] }; Returns: undefined }
      reserve_book: { Args: { _book_id: string }; Returns: string }
      staff_checkout: {
        Args: { _barcode: string; _email: string; _reservation_id?: string }
        Returns: string
      }
      staff_mark_fine_paid: { Args: { _id: string }; Returns: undefined }
      staff_return: { Args: { _barcode: string }; Returns: Json }
      staff_set_reservation: {
        Args: {
          _id: string
          _status: Database["public"]["Enums"]["reservation_status"]
        }
        Returns: undefined
      }
      super_admin_set_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "student" | "faculty" | "librarian" | "admin" | "super_admin"
      borrow_status: "active" | "returned" | "lost"
      copy_status:
        | "available"
        | "borrowed"
        | "reserved"
        | "maintenance"
        | "lost"
      fine_status: "unpaid" | "paid" | "waived"
      notification_type:
        | "reservation"
        | "availability"
        | "due_soon"
        | "overdue"
        | "announcement"
      reservation_status:
        | "pending"
        | "approved"
        | "ready_for_pickup"
        | "cancelled"
        | "completed"
        | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["student", "faculty", "librarian", "admin", "super_admin"],
      borrow_status: ["active", "returned", "lost"],
      copy_status: ["available", "borrowed", "reserved", "maintenance", "lost"],
      fine_status: ["unpaid", "paid", "waived"],
      notification_type: [
        "reservation",
        "availability",
        "due_soon",
        "overdue",
        "announcement",
      ],
      reservation_status: [
        "pending",
        "approved",
        "ready_for_pickup",
        "cancelled",
        "completed",
        "expired",
      ],
    },
  },
} as const
