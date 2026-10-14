import urllib.parse
from typing import Any, Dict, List, Optional, Tuple
import requests

from chokepoint.config import DEPS_DEV_API_BASE, DEPS_CACHE_DIR, OSV_API_BASE, OSV_CACHE_DIR
from chokepoint.ingestion.cache import DiskCache

deps_cache = DiskCache(DEPS_CACHE_DIR)
osv_cache = DiskCache(OSV_CACHE_DIR)

class DepsClient:
    def __init__(self, timeout: int = 15):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "ChokePoint-Agent/1.0",
            "Accept": "application/json"
        })
        self.timeout = timeout

    def get_dependencies(self, system: str, package: str, version: str) -> Dict[str, Any]:
        """
        Fetch resolved dependency graph for a package version from deps.dev.
        Returns {'nodes': [...], 'edges': [...]}
        """
        system_lower = system.lower()
        encoded_package = urllib.parse.quote(package, safe="")
        cache_key = f"deps:{system_lower}:{package}:{version}"
        cached = deps_cache.get(cache_key)
        if cached is not None:
            return cached

        url = f"{DEPS_DEV_API_BASE}/systems/{system_lower}/packages/{encoded_package}/versions/{version}:dependencies"
        resp = self.session.get(url, timeout=self.timeout)
        resp.raise_for_status()
        data = resp.json()
        deps_cache.set(cache_key, data)
        return data

    def get_package_versions(self, system: str, package: str) -> List[str]:
        """
        Fetch list of all published versions for a package from deps.dev.
        """
        system_lower = system.lower()
        encoded_package = urllib.parse.quote(package, safe="")
        cache_key = f"versions:{system_lower}:{package}"
        cached = deps_cache.get(cache_key)
        if cached is not None:
            return cached

        url = f"{DEPS_DEV_API_BASE}/systems/{system_lower}/packages/{encoded_package}"
        resp = self.session.get(url, timeout=self.timeout)
        resp.raise_for_status()
        data = resp.json()
        versions_data = data.get("versions", [])
        versions = [v.get("versionKey", {}).get("version") for v in versions_data if v.get("versionKey", {}).get("version")]
        deps_cache.set(cache_key, versions)
        return versions

    def get_advisories_batch(self, ecosystem: str, package_versions: List[Tuple[str, str]]) -> Dict[Tuple[str, str], List[Dict[str, Any]]]:
        """
        Batch query OSV for security advisories for a list of (package, version) tuples.
        """
        results: Dict[Tuple[str, str], List[Dict[str, Any]]] = {}
        missing_queries = []
        missing_keys = []

        for pkg, ver in package_versions:
            cache_key = f"osv:{ecosystem.lower()}:{pkg}:{ver}"
            cached = osv_cache.get(cache_key)
            if cached is not None:
                results[(pkg, ver)] = cached
            else:
                missing_queries.append({
                    "package": {"name": pkg, "ecosystem": ecosystem},
                    "version": ver
                })
                missing_keys.append((pkg, ver))

        if not missing_queries:
            return results

        # Query in chunks of 500
        chunk_size = 500
        for i in range(0, len(missing_queries), chunk_size):
            chunk_queries = missing_queries[i:i + chunk_size]
            chunk_keys = missing_keys[i:i + chunk_size]
            
            url = f"{OSV_API_BASE}/querybatch"
            payload = {"queries": chunk_queries}
            resp = self.session.post(url, json=payload, timeout=self.timeout)
            resp.raise_for_status()
            batch_resp = resp.json().get("results", [])

            for (pkg, ver), r in zip(chunk_keys, batch_resp):
                vulns = r.get("vulns", [])
                parsed_vulns = []
                for v in vulns:
                    cvss_score = 0.0
                    for sev in v.get("severity", []):
                        score_str = sev.get("score")
                        # Basic cvss parser if numeric, otherwise fallback
                        try:
                            cvss_score = float(score_str)
                        except (ValueError, TypeError):
                            cvss_score = 7.5 # Default high if unspecified
                    
                    parsed_vulns.append({
                        "id": v.get("id"),
                        "summary": v.get("summary", ""),
                        "details": v.get("details", ""),
                        "cvss3": cvss_score,
                        "aliases": v.get("aliases", []),
                        "published": v.get("published", "")
                    })

                cache_key = f"osv:{ecosystem.lower()}:{pkg}:{ver}"
                osv_cache.set(cache_key, parsed_vulns)
                results[(pkg, ver)] = parsed_vulns

        return results
