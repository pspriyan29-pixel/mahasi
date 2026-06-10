export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  role: 'user' | 'admin' | 'partner';
  email?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  base_price: number;
  min_price?: number;
  max_price?: number;
  estimated_time: string;
}

export interface Order {
  id: string;
  order_code: string;
  user_id: string;
  service_id: string;
  title: string;
  description: string;
  deadline: string;
  difficulty: 'easy' | 'normal' | 'hard' | 'complex';
  priority: 'normal' | 'cepat' | 'express' | 'super_urgent';
  estimated_price: number;
  final_price?: number;
  status: string;
  progress: number;
  revision_limit: number;
  revision_used: number;
  admin_note?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderFile {
  id: string;
  order_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  file_category: 'user_attachment' | 'admin_preview' | 'admin_final' | 'revision_attachment';
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  amount: number;
  method: string;
  status: 'unpaid' | 'pending_verification' | 'paid' | 'rejected' | 'expired' | 'refunded';
  proof_url?: string;
  gateway_reference?: string;
  paid_at?: string;
  created_at: string;
}

export interface Revision {
  id: string;
  order_id: string;
  user_id: string;
  revision_number: number;
  note: string;
  attachment_url?: string;
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  admin_response?: string;
  created_at: string;
}

export interface ForumThread {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  status: 'open' | 'solved' | 'locked';
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
  replies_count?: number;
}

export interface ForumComment {
  id: string;
  thread_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link_url?: string;
  created_at: string;
}
