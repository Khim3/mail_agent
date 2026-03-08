export type StoredEmail = {
  id: string;
  subject?: string | null;
  from?: string | null;
  to?: string | null;
  body: string;
};

export type MemoryStore = {
  emails: StoredEmail[];
};
