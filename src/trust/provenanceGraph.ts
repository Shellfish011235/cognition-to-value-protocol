export type TrustNodeType =
  | 'agent'
  | 'model'
  | 'tool'
  | 'source'
  | 'evidence'
  | 'hypothesis'
  | 'decision'
  | 'policy'
  | 'action'
  | 'result';

export interface TrustNode {
  id: string;
  type: TrustNodeType;
  createdAt: number;
  trust: number;
  metadata?: Record<string, unknown>;
}

export interface TrustEdge {
  from: string;
  to: string;
  relation: string;
  createdAt: number;
}

export class ProvenanceGraph {
  private readonly nodes = new Map<string, TrustNode>();
  private readonly edges: TrustEdge[] = [];

  addNode(node: TrustNode): void {
    if (node.trust < 0 || node.trust > 1) throw new Error('trust must be between 0 and 1');
    this.nodes.set(node.id, node);
  }

  addEdge(edge: TrustEdge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error('both edge endpoints must exist');
    }
    this.edges.push(edge);
  }

  getNode(id: string): TrustNode | undefined {
    return this.nodes.get(id);
  }

  dependenciesOf(id: string): TrustNode[] {
    const dependencyIds = this.edges.filter((edge) => edge.to === id).map((edge) => edge.from);
    return dependencyIds.flatMap((dependencyId) => {
      const node = this.nodes.get(dependencyId);
      return node ? [node] : [];
    });
  }

  affectedBy(sourceId: string): TrustNode[] {
    const visited = new Set<string>();
    const queue = [sourceId];

    while (queue.length) {
      const current = queue.shift()!;
      for (const edge of this.edges.filter((candidate) => candidate.from === current)) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.push(edge.to);
        }
      }
    }

    return [...visited].flatMap((id) => {
      const node = this.nodes.get(id);
      return node ? [node] : [];
    });
  }
}
