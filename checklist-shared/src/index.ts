export type ApiErrorDto = {
  error: string;
};

export type PaginationDto = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginatedDto<T> = {
  data: T[];
  pagination: PaginationDto;
};

export type ApiDataDto<T> = {
  data: T;
};

export type UserDto = {
  id: number;
  email: string;
  name: string;
  role: "user" | "admin";
};

export type LoginRequestDto = {
  email: string;
  password: string;
};

export type RegisterRequestDto = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponseDto = {
  token: string;
  user: UserDto;
};

export type TemplateListItemDto = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  versionNumber: number;
  updatedAt: Date;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  activity: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

export type TemplateDetailsDto = TemplateListItemDto & {
  status: "draft" | "published" | "archived";
  sections: Array<{
    id: number;
    title: string;
    description: string | null;
    sortOrder: number;
    items: Array<{
      id: number;
      text: string;
      description: string | null;
      isRequired: boolean;
      sortOrder: number;
    }>;
  }>;
};

export type ChecklistProgressDto = {
  totalItems: number;
  completedItems: number;
  percentage: number;
};

export type ChecklistListItemDto = {
  id: number;
  templateId: number | null;
  title: string;
  description: string | null;
  status: "active" | "completed" | "archived";
  startedAt: Date;
  completedAt: Date | null;
  updatedAt: Date;
  progress: ChecklistProgressDto;
  template: {
    id: number;
    title: string;
    category: {
      id: number;
      name: string;
      slug: string;
    };
  } | null;
};

export type ChecklistDetailsDto = ChecklistListItemDto & {
  sections: Array<{
    id: number;
    title: string;
    description: string | null;
    sortOrder: number;
    items: Array<{
      id: number;
      text: string;
      description: string | null;
      isRequired: boolean;
      isCompleted: boolean;
      completedAt: Date | null;
      sortOrder: number;
    }>;
  }>;
};

export type CreateChecklistRequestDto = {
  templateId: number;
};

export type AddChecklistItemRequestDto = {
  sectionId: number;
  text: string;
};

export type ToggleChecklistItemResponseDto = {
  checklistId: number;
};

export type SuggestionTypeDto =
  | "new_activity"
  | "new_template"
  | "template_edit"
  | "template_variant";

export type SuggestionStatusDto = "pending" | "accepted" | "rejected" | "implemented";

export type SuggestionDto = {
  id: number;
  type: SuggestionTypeDto;
  title: string;
  description: string;
  status: SuggestionStatusDto;
  adminNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  targetTemplate: {
    id: number;
    title: string;
  } | null;
  comments: Array<{
    id: number;
    text: string;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      email: string;
    } | null;
  }>;
};

export type CreateSuggestionRequestDto = {
  type: SuggestionTypeDto;
  title: string;
  description: string;
  targetTemplateId?: number | null;
};
