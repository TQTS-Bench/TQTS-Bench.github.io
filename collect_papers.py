#!/usr/bin/env python3
"""Collect arXiv metadata for the static TQTS-Bench paper view.

Only explicit overall execution-accuracy claims in an abstract become
paper-reported scores. The collector never executes paper code or queries.
"""

import argparse
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path

API = "https://export.arxiv.org/api/query"
ATOM = "{http://www.w3.org/2005/Atom}"
SEARCHES = (
    'all:"natural language querying" AND all:"time series"',
    'all:"text-to-query" AND all:"time-series"',
    'all:"natural language" AND all:"PromQL"',
    'all:"time-series database"',
)
SOURCE_RE = re.compile(r"(?:time[ -]series|\btsdbs?\b|\bpromql\b|\bprometheus\b|\binfluxdb\b)", re.I)
LANGUAGE_RE = re.compile(r"(?:natural[ -]language|text[ -]to[ -]query|language[ -]driven|\bnl2\w+\b|\bnlq\w*\b)", re.I)
QUERY_RE = re.compile(r"(?:quer(?:y|ies|ying)|retriev\w*|search\w*|promql|text[ -]to[ -]query)", re.I)
TITLE_QUERY_RE = re.compile(r"(?:quer(?:y|ies|ying)|retriev\w*|search\w*|promql|text[ -]to[ -]query)", re.I)
EXCLUDE_RE = re.compile(r"(?:video[ -]text temporal localization|forecasting only)", re.I)
CODE_RE = re.compile(r"https?://(?:www\.)?(?:github\.com|gitlab\.com|huggingface\.co)/[^\s<>)\]]+", re.I)
BENCHMARK_RE = re.compile(r"\bTQTS[ -]Bench\b", re.I)
SCORE_RE = re.compile(
    r"\b(?:overall\s+(?:execution\s+accuracy|EX)|execution\s+accuracy\s+overall)"
    r"\s*(?:of|is|:|=|reaches?|achieves?)?\s*(\d{1,2}(?:\.\d{1,2})?)\s*%",
    re.I,
)
ID_RE = re.compile(r"/(\d{4}\.\d{4,5})(?:v(\d+))?$")
USER_AGENT = "TQTS-Bench-Paper-Discovery/1.0 (+https://tqts-bench.github.io/)"
SELF_TITLE = "tqts-bench: a multi-syntax benchmark for text-to-query over time-series databases"
LAST_REQUEST = 0.0


def request(url):
    global LAST_REQUEST
    for attempt in range(3):
        wait = 3.2 - (time.monotonic() - LAST_REQUEST)
        if wait > 0:
            time.sleep(wait)
        LAST_REQUEST = time.monotonic()
        try:
            with urllib.request.urlopen(
                urllib.request.Request(url, headers={"User-Agent": USER_AGENT}), timeout=35
            ) as response:
                payload = response.read(3_000_001)
                if len(payload) > 3_000_000:
                    raise ValueError("arXiv response exceeded 3 MB")
                return payload
        except (OSError, ValueError) as error:
            if attempt == 2:
                raise RuntimeError(f"arXiv request failed: {error}") from error
            time.sleep(2 ** attempt)
    raise AssertionError("unreachable")


def clean(value):
    return " ".join((value or "").split())


def parse_entry(entry):
    raw_id = clean(entry.findtext(f"{ATOM}id"))
    match = ID_RE.search(raw_id)
    if not match:
        return None
    paper_id, version = match.group(1), int(match.group(2) or 1)
    title = clean(entry.findtext(f"{ATOM}title"))
    abstract = clean(entry.findtext(f"{ATOM}summary"))
    authors = [clean(author.findtext(f"{ATOM}name")) for author in entry.findall(f"{ATOM}author")]
    link = CODE_RE.search(abstract)
    code_url = link.group(0).rstrip(".,;") if link else None
    return {
        "id": paper_id,
        "version": version,
        "title": title,
        "abstract": abstract,
        "authors": authors,
        "published": clean(entry.findtext(f"{ATOM}published")),
        "updated": clean(entry.findtext(f"{ATOM}updated")),
        "url": f"https://arxiv.org/abs/{paper_id}",
        "codeUrl": code_url,
        "source": "auto-collected",
    }


def relevant(paper, include_ids):
    if paper["title"].casefold() == SELF_TITLE:
        return False
    if paper["id"] in include_ids:
        return True
    title = paper["title"]
    whole = f'{title} {paper["abstract"]}'
    return bool(
        SOURCE_RE.search(whole)
        and LANGUAGE_RE.search(whole)
        and QUERY_RE.search(whole)
        and TITLE_QUERY_RE.search(title)
        and not EXCLUDE_RE.search(title)
    )


def extract_score(paper):
    """Accept a single explicit overall TQTS-Bench EX claim in the abstract."""
    abstract = paper["abstract"]
    if not BENCHMARK_RE.search(abstract):
        return None
    evidence = []
    for sentence in re.split(r"(?<=[.!?])\s+", abstract):
        if BENCHMARK_RE.search(sentence):
            match = SCORE_RE.search(sentence)
            if match:
                evidence.append((sentence, float(match.group(1))))
    if len(evidence) != 1:
        return None
    sentence, score = evidence[0]
    method_name = paper["title"].split(":", 1)[0]
    if method_name.casefold() not in sentence.casefold():
        return None
    if not 0 <= score <= 100:
        return None
    return {
        "paperId": paper["id"],
        "name": method_name[:100],
        "type": "method",
        "group": "Paper-reported result",
        "overall": score,
        "metric": "Overall Execution Accuracy (EX, %)",
        "scope": "TQTS-Bench overall, as stated in the paper abstract",
        "paperVersion": paper["version"],
        "evidenceUrl": f'{paper["url"]}v{paper["version"]}',
        "evidenceText": sentence,
        "source": "auto-collected",
        "verification": "paper-reported",
    }


def query_arxiv(search, cutoff):
    results = []
    for start in range(0, 1000, 100):
        params = urllib.parse.urlencode({
            "search_query": search,
            "start": start,
            "max_results": 100,
            "sortBy": "lastUpdatedDate",
            "sortOrder": "descending",
        })
        root = ET.fromstring(request(f"{API}?{params}"))
        entries = root.findall(f"{ATOM}entry")
        for entry in entries:
            paper = parse_entry(entry)
            if paper:
                results.append(paper)
        if len(entries) < 100:
            break
        if entries and all(
            datetime.fromisoformat(item["updated"].replace("Z", "+00:00")) < cutoff
            for item in results[-len(entries):]
        ):
            break
    return [paper for paper in results if datetime.fromisoformat(paper["updated"].replace("Z", "+00:00")) >= cutoff]


def collect(previous, policy, now=None):
    now = now or datetime.now(timezone.utc)
    last = previous.get("lastSuccessfulSync")
    cutoff = min(
        datetime.fromisoformat(last.replace("Z", "+00:00")) - timedelta(days=7)
        if last else now - timedelta(days=365),
        now - timedelta(days=365),
    )
    if cutoff > now:
        cutoff = now - timedelta(days=365)
    selected = {item["id"]: item for item in previous.get("papers", [])}
    exclude_ids = set(policy.get("excludeIds", []))
    include_ids = set(policy.get("includeIds", []))
    for search in SEARCHES:
        for paper in query_arxiv(search, cutoff):
            if paper["id"] in exclude_ids or paper["title"].casefold() == SELF_TITLE:
                selected.pop(paper["id"], None)
                continue
            if relevant(paper, include_ids):
                old = selected.get(paper["id"])
                if old is None or paper["version"] >= old["version"]:
                    selected[paper["id"]] = paper
    for paper_id in exclude_ids:
        selected.pop(paper_id, None)
    selected = {paper_id: paper for paper_id, paper in selected.items() if relevant(paper, include_ids)}
    papers = sorted(selected.values(), key=lambda item: (item["published"], item["id"]), reverse=True)
    scores = [result for paper in papers if (result := extract_score(paper))]
    return {
        "schemaVersion": 1,
        "lastSuccessfulSync": now.replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "papers": papers,
        "reportedResults": scores,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, required=True)
    parser.add_argument("--policy", type=Path, required=True)
    parser.add_argument("--script", type=Path, required=True)
    args = parser.parse_args()
    previous = json.loads(args.data.read_text(encoding="utf-8"))
    policy = json.loads(args.policy.read_text(encoding="utf-8"))
    if previous.get("schemaVersion") != 1:
        raise ValueError("Unsupported discovery schema")
    updated = collect(previous, policy)
    content = json.dumps(updated, ensure_ascii=False, indent=2) + "\n"
    args.data.write_text(content, encoding="utf-8")
    args.script.write_text("window.TQTS_DISCOVERY = " + content.rstrip() + ";\n", encoding="utf-8")
    print(f'Collected {len(updated["papers"])} papers, {len(updated["reportedResults"])} explicit scores.')


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Paper collection failed: {error}", file=sys.stderr)
        sys.exit(1)
