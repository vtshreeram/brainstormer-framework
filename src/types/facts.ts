export type FactType = 
  | 'persona' 
  | 'feature' 
  | 'constraint' 
  | 'metric' 
  | 'infrastructure' 
  | 'risk';

export type RelationshipType = 
  | 'requires' 
  | 'solves' 
  | 'blocks' 
  | 'implies'
  | 'validates';

export interface Fact {
  id: string;
  projectId: string;
  type: FactType;
  title: string;
  description: string;
  properties: Record<string, any>;
  source: 'user' | 'ai_inferred' | 'ai_suggested';
  confidence: number; // 0 to 1
  createdAt: string;
  updatedAt: string;
}

export interface Relationship {
  sourceFactId: string;
  targetFactId: string;
  type: RelationshipType;
  description?: string;
}

export interface FactGraph {
  facts: Fact[];
  relationships: Relationship[];
}

export interface FactExtractionResult {
  facts: Omit<Fact, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>[];
  relationships: Omit<Relationship, 'sourceFactId' | 'targetFactId'> & {
    sourceFactTitle: string;
    targetFactTitle: string;
  }[];
  logicGaps: string[];
  suggestedQuestions: string[];
}
