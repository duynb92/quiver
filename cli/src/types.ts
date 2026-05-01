export interface Prompt {
  id: string;
  name: string;
  content: string;
  description: string | null;
  category: string;
  tags: string | null;
  variables: string | null;
  use_count: number;
  created_at: string;
  updated_at: string;
}
