import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

log_paths = [
    r"C:\Users\karen\.gemini\antigravity\brain\41d767c9-641f-4a47-ba77-03e69c15e4f3\.system_generated\logs\overview.txt",
    r"C:\Users\karen\.gemini\antigravity\brain\89e6c8af-8467-4da0-879c-1d678cff96d2\.system_generated\logs\overview.txt"
]

def search_component(comp_name):
    print(f"\n=================== SEARCHING FOR {comp_name} ===================")
    for path in log_paths:
        with open(path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
        
        matches = [m.start() for m in re.finditer(comp_name, content)]
        for idx, m in enumerate(matches):
            snippet = content[max(0, m-500):m+6000]
            snippet = snippet.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
            if "export default function" in snippet:
                print(f"Found match in {path} near position {m}:")
                func_idx = snippet.find("export default")
                print(snippet[func_idx:func_idx+4000])
                print("-" * 100)

search_component("CandidateDashboard")
search_component("CompanyDashboard")
search_component("JobDetails")
search_component("Home()")
