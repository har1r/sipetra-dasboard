import { TASK_ROLES, TASK_STAGES, TASK_STATUS, TASK_SERVICE, SUBDISTRICT_DATA } from '@/constants/task';

export type TaskRole = typeof TASK_ROLES[number];
export type TaskStage = typeof TASK_STAGES[number];
export type TaskStatus = typeof TASK_STATUS[number];
export type TaskService = typeof TASK_SERVICE[number];
export type Subdistrict = keyof typeof SUBDISTRICT_DATA;
export type Village = (typeof SUBDISTRICT_DATA)[Subdistrict][number];