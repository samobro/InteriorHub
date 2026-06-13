export type EngineerStatus = "pending" | "approved" | "disabled";

export interface Engineer {
  id: number;
  fullName: string;
  city: string;
  email: string;
  phone: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  status: EngineerStatus;
  trialEndsAt: string | null;
  projectsCount: number;
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  projectsCount: number;
  createdAt: string;
}

export interface Project {
  id: number;
  title: string;
  coverImageUrl: string | null;
  categoryId: number;
  categoryName: string;
  engineerId: number;
  engineerName: string;
  createdAt: string;
}

export interface ProjectDetail extends Project {
  description: string | null;
  images: string[];
  engineerEmail: string;
}

export interface ContactRequest {
  id: number;
  engineerId: number;
  engineerName: string;
  engineerEmail: string;
  clientName: string;
  clientEmail: string;
  message: string | null;
  createdAt: string;
}

export type ActivityType =
  | "engineer_signup"
  | "project_added"
  | "engineer_approved"
  | "engineer_disabled"
  | "contact_request";

export interface ActivityItem {
  id: number;
  type: ActivityType;
  message: string;
  timestamp: string;
  relatedId: number | null;
  relatedName: string | null;
}

export interface DashboardStats {
  totalEngineers: number;
  pendingApprovals: number;
  totalProjects: number;
  totalCategories: number;
  approvedEngineers: number;
  disabledEngineers: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ─── Engineer-portal–specific types ──────────────────────────────────────────

export interface EngineerProfile {
  id: number;
  fullName: string;
  email: string;
  city: string;
  phone: string | null;
  bio: string | null;
  profileImageUrl: string | null;
  status: EngineerStatus;
  trialEndsAt: string | null;
}

export interface EngineerProject {
  id: number;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  categoryId: number;
  categoryName: string;
  createdAt: string;
}

export interface ProjectImage {
  id: number;
  url: string;
  displayOrder: number;
}

export interface EngineerContactRequest {
  id: number;
  clientName: string;
  clientEmail: string;
  clientPhone: string | null;
  message: string | null;
  isRead: boolean;
  createdAt: string;
}
