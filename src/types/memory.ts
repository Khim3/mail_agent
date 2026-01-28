export type StoredEmail = {
  id: string;
  subject?: string | null;
  from?: string | null;
  body: string;
};

export type MemoryStore = {
  emails: StoredEmail[];
};
