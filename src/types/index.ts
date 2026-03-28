export interface Project {
  id: string;
  title: string;
  description: string | null;
  status:
    | "draft"
    | "in_progress"
    | "discovery_complete"
    | "documents_generated";
  createdAt: string;
  updatedAt: string;
  versions: Version[];
  generatedDocuments: GeneratedDocument[];
  shareSettings: ShareSettings;
}

export interface Version {
  id: string;
  versionNumber: string;
  name: string;
  createdAt: string;
  isCurrent: boolean;
  responses: Record<string, Response>;
}

export interface Response {
  questionId: string;
  question: string;
  answer: string;
  assumptions: Assumption[];
  isComplete: boolean;
  followUpQuestion?: string;
  followUpAnswer?: string;
  followUpSkipped?: boolean;
}

export interface Assumption {
  id: string;
  text: string;
  type: "technical" | "business" | "platform" | "general";
  confirmed: boolean;
}

export interface GeneratedDocument {
  id: string;
  type: "prd" | "architecture" | "user_stories" | "api_spec" | "roadmap";
  title: string;
  content: string;
  generatedAt: string;
  exportCount: number;
}

export interface ShareSettings {
  isShared: boolean;
  shareToken: string | null;
  allowComments: boolean;
}

export interface WizardStep {
  id: string;
  title: string;
  question: string;
  hint: string;
  placeholder?: string;
}

export interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export type DocumentType =
  | "prd"
  | "architecture"
  | "user_stories"
  | "api_spec"
  | "roadmap";

export interface DocumentOption {
  type: DocumentType;
  title: string;
  description: string;
  selected: boolean;
}

export interface AiProductSuggestion {
  title: string;
  description: string;
}

export interface AiSuggestionsResult {
  metrics: string[];
  suggestions: AiProductSuggestion[];
}
