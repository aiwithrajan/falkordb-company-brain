export interface GraphNode {
  id: string;
  internal_id?: number;
  label: string;
  type: string;
  labels: string[];
  properties: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  relation: string;
  properties: Record<string, any>;
}

export interface Subgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface ToolTrace {
  tool: string;
  input: any;
  output: any;
  explanation: string;
}

export interface ConflictInfo {
  claim_a: {
    id: string;
    value: string;
    status: string;
    valid_from: string;
    source_doc: string;
    source_uri?: string;
  };
  claim_b: {
    id: string;
    value: string;
    status: string;
    valid_from: string;
    source_doc: string;
    source_uri?: string;
  };
  conflict_reason: string;
}

export interface Expert {
  person_id: string;
  name: string;
  role: string;
  email: string;
  evidence: string[];
  confidence_score: number;
}

export interface InvestigationResponse {
  question: string;
  target_service: string;
  answer: string;
  tool_traces: ToolTrace[];
  subgraph: Subgraph;
  ownership: Record<string, any>;
  dependencies: Record<string, any>;
  incidents: any[];
  conflict_data: {
    has_conflict: boolean;
    conflicts: ConflictInfo[];
    historical_resolutions?: ConflictInfo[];
    subgraph?: Subgraph;
  };
  experts: Expert[];
  pending_correction?: {
    claim_id: string;
    stale_value: string;
    approved_value: string;
    source_doc_a: string;
    source_doc_b: string;
    recommended_action: string;
  } | null;
}

export interface OverviewData {
  company_name: string;
  counts: {
    services: number;
    teams: number;
    people: number;
    incidents: number;
    active_conflicts: number;
    decisions: number;
  };
  dependency_graph: Subgraph;
}
