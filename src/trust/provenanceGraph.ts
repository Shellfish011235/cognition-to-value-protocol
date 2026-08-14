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
  revoked?: boolean;
  revokedAt?: number;
  revocationReason?: string;
  metadata?: Record<string, unknown>;
}

export interface TrustEdge {
  from: string;
  to: string;
  relation: string;
  createdAt: number;
}

export interface RevocationImpact {
  revokedSource: TrustNode;
  affected: TrustNode[];
}

export class ProvenanceGraph {
  private readonly nodes = new Map<string, TrustNode>();
  private readonly edges: TrustEdge[] = [];

  addNode(node: TrustNode): void {
    if (node.trust < 0 || node.trust > 1) throw new Error('trust must be between 0 and 1');
    this.nodes.set(node.id, { ...node });
  }

  addEdge(edge: TrustEdge): void {
    if (!this.nodes.has(edge.from) || !this.nodes.has(edge.to)) {
      throw new Error('both edge endpoints must exist');
    }
    this.edges.push({ ...edge });
  }

  getNode(id: string): TrustNode | undefined {
    const node = this.nodes.get(id);
    return node ? { ...node } : undefined;
  }

  dependenciesOf(id: string): TrustNode[] {
    const dependencyIds = this.edges.filter((edge) => edge.to === id).map((edge) => edge.from);
    return dependencyIds.flatMap((dependencyId) => {
      const node = this.nodes.get(dependencyId);
      return node ? [{ ...node }] : [];
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
      return node ? [{ ...node }] : [];
    });
  }

  revokeNode(id: string, reason: string, now = Date.now(), propagate = true): RevocationImpact {
    const source = this.nodes.get(id);
    if (!source) throw new Error(`unknown trust node: ${id}`);

    const impactedIds = propagate ? this.affectedBy(id).map((node) => node.id) : [];
    const allIds = [id, ...impactedIds];

    for (const nodeId of allIds) {
      const node = this.nodes.get(nodeId);
      if (!node) continue;
      this.nodes.set(nodeId, {
        ...node,
        trust: 0,
        revoked: true,
        revokedAt: now,
        revocationReason: nodeId === id ? reason : `upstream revocation: ${id}: ${reason}`,
      });
    }

    return {
      revokedSource: { ...this.nodes.get(id)! },
      affected: impactedIds.flatMap((nodeId) => {
        const node = this.nodes.get(nodeId);
        return node ? [{ ...node }] : [];
      }),
    };
  }
}
