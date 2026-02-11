export type StoredEmail = {
  id: string;
  subject?: string | null;
  from?: string | null;
  body: string;
  recipients?: {
    to: string[];
    cc: string[];
  };
};

export type MemoryStore = {
  emails: StoredEmail[];
  pendingSend?: {
    requiresConfirmation: boolean;
    recipients: string[];
  };
};
