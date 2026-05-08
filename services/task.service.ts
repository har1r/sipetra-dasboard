// src/services/task.service.ts

import { Task } from "@/models/task.model";

import {
  CreateTaskInput,
  UpdateTaskInput,
} from "@/validations/task.validation";

export async function createTaskService(
  data: CreateTaskInput
) {
  return await Task.create(data);
}

export async function getTasksService() {
  return await Task.find().sort({
    createdAt: -1,
  });
}

export async function getTaskByIdService(
  id: string
) {
  return await Task.findById(id);
}

export async function updateTaskService(
  id: string,
  data: UpdateTaskInput
) {
  return await Task.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    }
  );
}