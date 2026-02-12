export type TaskType =
  | "PAYROLL"
  | "INVOICE"
  | "LEAVE"
  | "GENERAL";

const ROLE_ALIAS: Record<string, string> = {
  HR: "nhatkhiem003@gmail.com",
  IT: "nhkhi3m1602@gmail.com",
};

const TASK_RECIPIENT_RULES: Record<TaskType, string[]> = {
  PAYROLL: ["HR"],
  INVOICE: ["HR"],
  LEAVE: ["HR"],
  GENERAL: ["HR"],
};

export function resolveRecipients(taskType: TaskType): string[] {
  const roles = TASK_RECIPIENT_RULES[taskType] || ["HR"];

  return roles.map((role) => ROLE_ALIAS[role]);
}
