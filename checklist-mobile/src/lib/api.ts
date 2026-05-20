import type {
  AddChecklistItemRequestDto,
  ApiDataDto,
  AuthResponseDto,
  ChecklistDetailsDto,
  ChecklistListItemDto,
  CreateChecklistRequestDto,
  CreateSuggestionRequestDto,
  LoginRequestDto,
  PaginatedDto,
  RegisterRequestDto,
  SuggestionDto,
  TemplateDetailsDto,
  TemplateListItemDto,
  UserDto,
} from "@checklisthub/shared";

import { CHECKLISTHUB_API_URL } from "./config";
import { getStoredToken } from "./tokenStorage";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
};

async function request<T>(path: string, options: RequestOptions = {}) {
  const token = options.token === undefined ? await getStoredToken() : options.token;
  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${CHECKLISTHUB_API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload.error === "string" ? payload.error : "Request failed.";
    throw new Error(message);
  }

  return payload as T;
}

export function login(body: LoginRequestDto) {
  return request<AuthResponseDto>("/api/auth/login", { method: "POST", body, token: null });
}

export function register(body: RegisterRequestDto) {
  return request<AuthResponseDto>("/api/auth/register", { method: "POST", body, token: null });
}

export function me(token?: string | null) {
  return request<ApiDataDto<UserDto>>("/api/auth/me", { token });
}

export function listTemplates(page = 1) {
  return request<PaginatedDto<TemplateListItemDto>>(`/api/templates?page=${page}&pageSize=20`);
}

export function getTemplate(id: number) {
  return request<ApiDataDto<TemplateDetailsDto>>(`/api/templates/${id}`);
}

export function listChecklists(page = 1) {
  return request<PaginatedDto<ChecklistListItemDto>>(`/api/checklists?page=${page}&pageSize=20`);
}

export function createChecklist(body: CreateChecklistRequestDto) {
  return request<ApiDataDto<ChecklistListItemDto>>("/api/checklists", { method: "POST", body });
}

export function getChecklist(id: number) {
  return request<ApiDataDto<ChecklistDetailsDto>>(`/api/checklists/${id}`);
}

export function addChecklistItem(checklistId: number, body: AddChecklistItemRequestDto) {
  return request<ApiDataDto<ChecklistDetailsDto>>(`/api/checklists/${checklistId}/items`, {
    method: "POST",
    body,
  });
}

export function toggleChecklistItem(checklistId: number, itemId: number) {
  return request<{ checklistId: number }>(`/api/checklists/${checklistId}/items/${itemId}/toggle`, {
    method: "POST",
  });
}

export function listSuggestions(page = 1) {
  return request<PaginatedDto<SuggestionDto>>(`/api/suggestions?page=${page}&pageSize=20`);
}

export function createSuggestion(body: CreateSuggestionRequestDto) {
  return request<ApiDataDto<SuggestionDto>>("/api/suggestions", { method: "POST", body });
}
