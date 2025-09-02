import json, re, sys
from pathlib import Path

#This function is used to find the strongest negative score in a list of fields
#It is written by ChatGPT 5 to summarize the TensiStrength dataset for stress detection
#The results list is checked to ensure the content is correct
def strongest_neg_score(fields):
    # fields may be: [term, -5] or [term, +1, -4] etc.
    nums = [int(x) for x in fields[1:] if re.fullmatch(r"-?\d+", x)]
    if not nums: 
        return None
    # if two numbers exist, many versions use [pos, neg]; take the most negative
    return min(nums)

strong_terms = set()

for fname in [
    "frontend/data/raw/TensiStrength_Data/SentimentLookupTable.txt",
    "frontend/data/raw/TensiStrength_Data/SlangLookupTable.txt",
    "frontend/data/raw/TensiStrength_Data/IdiomLookupTable.txt",
    "frontend/data/raw/TensiStrength_Data/EmoticonLookupTable.txt",
]:
    p = Path(fname)
    if not p.exists(): 
        continue
    for line in p.read_text(encoding="utf-8", errors="ignore").splitlines():
        if not line.strip() or line.strip().startswith("#"): 
            continue
        parts = [x.strip() for x in line.split("\t") if x.strip()]
        score = strongest_neg_score(parts)
        if score is not None and score <= -4:
            strong_terms.add(parts[0].lower())

out = {"strong_stress_terms": sorted(strong_terms)}
Path("frontend/data/negative_terms.json").write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Wrote {len(strong_terms)} terms to frontend/data/negative_terms.json")
