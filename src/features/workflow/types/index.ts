export type InstanceStatus =
  | "draft"
  | "in_progress"
  | "in_review"
  | "revision_requested"
  | "approved"
  | "rejected"
  | "canceled";

export type StepStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "in_review"
  | "approved"
  | "revision_requested"
  | "skipped";

export type ReviewAction =
  | "approved"
  | "revision_requested"
  | "rejected"
  | "commented";

export interface ProductStep {
  id: string;
  product_id: string;
  title: string;
  description: string | null;
  order: number;
  type: "form" | "upload" | "admin_action" | "review" | "info";
  is_required: boolean;
  config: Record<string, unknown>;
}

export interface UserProductInstance {
  id: string;
  user_id: string;
  product_id: string;
  order_id: string | null;
  status: InstanceStatus;
  metadata: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserStep {
  id: string;
  user_product_id: string;
  product_step_id: string;
  status: StepStatus;
  data: Record<string, unknown>;
  files: FileRef[];
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  // join
  product_step?: ProductStep;
}

export interface FileRef {
  name: string;
  path: string;
  url: string;
}

export interface StepReview {
  id: string;
  user_step_id: string;
  admin_id: string;
  action: ReviewAction;
  comment: string | null;
  created_at: string;
}
