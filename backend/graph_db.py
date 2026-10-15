from typing import Any, Dict, List, Optional, Tuple
from falkordb import FalkorDB, Node, Edge, Path
from backend.config import settings

class GraphDatabase:
    def __init__(self):
        self.client = FalkorDB(host=settings.FALKORDB_HOST, port=settings.FALKORDB_PORT)
        self.graph_name = settings.GRAPH_NAME
        self.graph = self.client.select_graph(self.graph_name)

    def query(self, cypher: str, params: Optional[Dict[str, Any]] = None):
        """Execute a Cypher query on the selected FalkorDB graph."""
        return self.graph.query(cypher, params or {})

    def delete_graph(self):
        """Drop the graph completely."""
        try:
            self.graph.delete()
        except Exception:
            pass
        self.graph = self.client.select_graph(self.graph_name)

    def extract_subgraph(self, result_set: List[List[Any]]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Parses a query result set containing Nodes, Edges, and Paths,
        and aggregates them into unique nodes and edges for frontend visualization.
        Ensures internal FalkorDB node IDs on edges are mapped to custom node 'id' properties.
        """
        nodes_dict: Dict[str, Dict[str, Any]] = {}
        internal_id_to_key: Dict[int, str] = {}
        edges_list: List[Dict[str, Any]] = []
        edge_signatures = set()

        def process_node(n: Node):
            # Prefer 'id' property if present, otherwise fallback to internal FalkorDB id
            node_key = str(n.properties.get("id") or f"node_{n.id}")
            internal_id_to_key[n.id] = node_key
            if node_key not in nodes_dict:
                primary_label = n.labels[0] if n.labels else "Entity"
                display_name = n.properties.get("name") or n.properties.get("title") or node_key
                nodes_dict[node_key] = {
                    "id": node_key,
                    "internal_id": n.id,
                    "label": display_name,
                    "type": primary_label,
                    "labels": n.labels,
                    "properties": dict(n.properties)
                }
            return node_key

        def process_edge(e: Edge, src_key: Optional[str] = None, dest_key: Optional[str] = None):
            s_key = src_key or internal_id_to_key.get(e.src_node, f"node_{e.src_node}")
            d_key = dest_key or internal_id_to_key.get(e.dest_node, f"node_{e.dest_node}")
            edge_sig = f"{s_key}-{e.relation}->{d_key}"
            if edge_sig not in edge_signatures:
                edge_signatures.add(edge_sig)
                edges_list.append({
                    "id": f"edge_{len(edges_list)}",
                    "source": s_key,
                    "target": d_key,
                    "relation": e.relation,
                    "properties": dict(e.properties)
                })

        # Pass 1: Process all nodes to establish internal ID mapping
        for row in result_set:
            for item in row:
                if isinstance(item, Node):
                    process_node(item)
                elif isinstance(item, Path):
                    for pn in item.nodes():
                        process_node(pn)

        # Pass 2: Process all edges and paths with guaranteed node keys
        for row in result_set:
            for item in row:
                if isinstance(item, Edge):
                    process_edge(item)
                elif isinstance(item, Path):
                    path_nodes = item.nodes()
                    path_edges = item.edges()
                    node_keys = [process_node(pn) for pn in path_nodes]
                    for idx, pe in enumerate(path_edges):
                        if idx < len(node_keys) - 1:
                            process_edge(pe, src_key=node_keys[idx], dest_key=node_keys[idx + 1])
                        else:
                            process_edge(pe)

        return {
            "nodes": list(nodes_dict.values()),
            "edges": edges_list
        }

db = GraphDatabase()
