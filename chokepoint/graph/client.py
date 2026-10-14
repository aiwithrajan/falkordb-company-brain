from typing import Optional, List
import falkordb
from falkordb import FalkorDB, Graph

from chokepoint.config import FALKORDB_HOST, FALKORDB_PORT

class FalkorManager:
    def __init__(self, host: str = FALKORDB_HOST, port: int = FALKORDB_PORT):
        self.host = host
        self.port = port
        self._client: Optional[FalkorDB] = None

    def get_client(self) -> FalkorDB:
        if self._client is None:
            self._client = FalkorDB(host=self.host, port=self.port)
        return self._client

    def get_graph(self, graph_name: str) -> Graph:
        client = self.get_client()
        return client.select_graph(graph_name)

    def copy_graph(self, source_name: str, dest_name: str) -> Graph:
        """
        Executes GRAPH.COPY source dest in FalkorDB.
        """
        src_graph = self.get_graph(source_name)
        # Using built-in Graph.copy
        src_graph.copy(dest_name)
        return self.get_graph(dest_name)

    def delete_graph(self, graph_name: str) -> None:
        try:
            graph = self.get_graph(graph_name)
            graph.delete()
        except Exception:
            pass

    def list_graphs(self) -> List[str]:
        client = self.get_client()
        try:
            return client.list_graphs()
        except Exception:
            return []
