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

export type PendingSend = {
  requiresConfirmation: boolean;
  taskType?: string;
  recipients: {
    to: string[];
    cc: string[];
  };
  allRecipients: string[];
  createdAt: string;
};

export type MemoryStore = {
  emails: StoredEmail[];
  pendingSend?: PendingSend;
};
