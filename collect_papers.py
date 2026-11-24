#!/usr/bin/env python3
"""Evidence-based paper discovery. Never extracts scores or executes paper code.

arXiv supplies candidate metadata; public full text supplies benchmark evidence.
Papers With Code's read API is an optional full-text source, followed by arXiv.
No local manuscript content, author information, or private paper ID is uploaded.
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from html.parser import HTMLParser
from pathlib import Path

ATOM = '{http://www.w3.org/2005/Atom}'
API = 'https://export.arxiv.org/api/query'
SEARCHES = ('all:"TQTS-Bench"', 'all:"text-to-query" AND all:"time-series"',
            'all:"natural language" AND all:"PromQL"',
            'all:"natural language querying" AND all:"time series"')
BENCHMARK = re.compile(r'\bTQTS\s*[-\u2010-\u2015]?\s*Bench\b', re.I)
PAPER_ID = re.compile(r'/(\d{4}\.\d{4,5})(?:v(\d+))?$')
CODE = re.compile(r'https://(?:github\.com|gitlab\.com|huggingface\.co)/[^\s<>\]\)"}]+')
LAST_REQUEST = 0


class TextOnly(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.hidden = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.hidden += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.hidden = max(0, self.hidden - 1)
    def handle_data(self, data):
        if not self.hidden: self.parts.append(data)


def clean(text):
    return ' '.join((text or '').split())


def request(url, limit=4_000_000):
    global LAST_REQUEST
    for attempt in range(3):
        delay = 3.2 - (time.monotonic() - LAST_REQUEST)
        if delay > 0: time.sleep(delay)
        LAST_REQUEST = time.monotonic()
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'TQTS-Bench-Discovery/2.0 (+https://tqts-bench.github.io/)'})
            with urllib.request.urlopen(req, timeout=30) as response:
                data = response.read(limit + 1)
                if len(data) > limit: raise ValueError('Source exceeds size limit')
                return data
        except urllib.error.HTTPError as error:
            if error.code in (404, 410): return None
            if attempt == 2: raise
        except OSError:
            if attempt == 2: raise
        time.sleep(2 ** attempt)


def parse_entry(entry):
    match = PAPER_ID.search(clean(entry.findtext(ATOM + 'id')))
    if not match: return None
    abstract = clean(entry.findtext(ATOM + 'summary'))
    code = CODE.search(abstract)
    return dict(id=match[1], version=int(match[2] or 1),
                title=clean(entry.findtext(ATOM + 'title')), abstract=abstract,
                published=clean(entry.findtext(ATOM + 'published')),
                updated=clean(entry.findtext(ATOM + 'updated')),
                url=f'https://arxiv.org/abs/{match[1]}',
                codeUrl=code[0].rstrip('.,;') if code else None)


def is_self(paper, policy):
    title = paper['title'].casefold()
    return paper['id'] in policy.get('excludeIds', []) or title.startswith(('tqts-bench:', 'tqts bench:')) or ('multi-syntax benchmark' in title and 'time-series' in title)


def evidence(text, url):
    match = BENCHMARK.search(text)
    if not match: return None
    excerpt = clean(text[max(0, match.start()-140):match.end()+240])
    return {'kind': 'benchmark-reference', 'text': excerpt, 'url': url}


def query_arxiv(search, cutoff):
    papers = []
    for start in range(0, 1000, 100):
        params = urllib.parse.urlencode(dict(search_query=search, start=start,
            max_results=100, sortBy='lastUpdatedDate', sortOrder='descending'))
        payload = request(API + '?' + params)
        if not payload: raise RuntimeError('arXiv returned no feed')
        feed = ET.fromstring(payload)
        entries = feed.findall(ATOM + 'entry')
        if any((e.findtext(ATOM+'id') or '').endswith('/errors') for e in entries):
            raise RuntimeError('arXiv returned an error feed')
        batch = [p for e in entries if (p := parse_entry(e))]
        papers.extend(p for p in batch if p['updated'] >= cutoff)
        if len(entries) < 100 or (batch and batch[-1]['updated'] < cutoff): break
    else:
        raise RuntimeError('arXiv pagination limit reached; refusing to mark incomplete scan successful')
    return papers


def full_text(paper):
    """Only requests public paper IDs obtained from arXiv metadata."""
    pid = f'{paper["id"]}v{paper["version"]}'
    sources = [f'https://arxiv.org/html/{pid}',
               f'https://paperswithcode.co/api/v1/research/papers/{paper["id"]}/read']
    for url in sources:
        try:
            body = request(url)
            if not body: continue
            decoded = body.decode('utf-8')
            if 'arxiv.org/html' in url:
                parser = TextOnly(); parser.feed(decoded)
                text = clean(' '.join(parser.parts))
                if len(text) > 3000: return text, url
            # PwC read responses may be bounded. Use it only to prove a match;
            # absence in a partial response is never a negative classification.
            elif BENCHMARK.search(decoded): return clean(decoded), url
        except (OSError, ValueError):
            continue
    url = f'https://arxiv.org/pdf/{pid}'
    body = request(url, 25_000_000)
    if body:
        import fitz
        with fitz.open(stream=body, filetype='pdf') as doc:
            text = clean(' '.join(page.get_text() for page in doc))
        if len(text) > 2000: return text, url
    raise RuntimeError('Public full text unavailable')


def collect(previous, policy, cache, now=None):
    now = now or datetime.now(timezone.utc)
    stamp = now.replace(microsecond=0).isoformat().replace('+00:00','Z')
    cutoff = (now - timedelta(days=policy.get('lookbackDays', 730))).isoformat().replace('+00:00','Z')
    candidates = {p['id']: p for p in previous.get('papers', [])}
    errors = []
    for search in SEARCHES:
        try:
            for paper in query_arxiv(search, cutoff): candidates[paper['id']] = paper
        except Exception as error:
            errors.append(f'Candidate search failed: {type(error).__name__}')
    selected = {p['id']: p for p in previous.get('papers', []) if p.get('evidence') and not is_self(p, policy)}
    for pid, paper in candidates.items():
        if is_self(paper, policy): selected.pop(pid, None); continue
        old = cache.get(pid, {})
        # Recheck negative results weekly and updated versions immediately.
        cached = old.get('version') == paper['version'] and old.get('checkedAt','') >= (now-timedelta(days=7)).isoformat().replace('+00:00','Z')
        proof = old.get('evidence') if cached else evidence(paper.get('abstract',''), paper['url'])
        if not cached and not proof:
            try:
                text, source = full_text(paper)
                proof = evidence(text, source)
                if not paper.get('codeUrl') and (link := CODE.search(text)): paper['codeUrl'] = link[0].rstrip('.,;')
            except Exception as error:
                errors.append(f'{pid}: full text check failed ({type(error).__name__})')
                continue
        if cached and not paper.get('codeUrl'):
            paper['codeUrl'] = old.get('codeUrl')
        cache[pid] = dict(version=paper['version'], checkedAt=stamp, evidence=proof, codeUrl=paper.get('codeUrl'))
        if proof:
            # Only whitelisted public fields are serialized; no authors or scores.
            item = {k:paper.get(k) for k in ('id','version','title','published','updated','url','codeUrl')}
            override = policy.get('codeUrls',{}).get(pid)
            if override and override.startswith('https://'): item['codeUrl'] = override
            # Keep verbatim citation text in the ignored cache only: it can name the anonymous authors.
            item['evidence'] = {'kind': proof['kind'], 'url': proof['url'],
                                'text': 'This public paper explicitly references TQTS-Bench.'}
            selected[pid] = item
        else: selected.pop(pid, None)
    result = dict(schemaVersion=2, lastAttempt=stamp,
                  lastAttemptStatus='failed' if errors else 'success',
                  lastSuccessfulSync=previous.get('lastSuccessfulSync') if previous.get('schemaVersion')==2 else None,
                  papers=sorted(selected.values(), key=lambda p:(p['published'],p['id']), reverse=True))
    if not errors: result['lastSuccessfulSync'] = stamp
    return result, errors


def save(data, script, value):
    content = json.dumps(value, ensure_ascii=False, indent=2)+'\n'
    # Stage both complete outputs before replacing either one.
    a = data.with_suffix('.json.tmp'); b = script.with_suffix('.js.tmp')
    a.write_text(content, encoding='utf-8')
    b.write_text('window.TQTS_DISCOVERY = '+content.rstrip()+';\n', encoding='utf-8')
    a.replace(data); b.replace(script)


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--data',type=Path,required=True)
    parser.add_argument('--policy',type=Path,required=True)
    parser.add_argument('--script',type=Path,required=True)
    parser.add_argument('--cache',type=Path,default=Path('.cache/discovery-checks.json'))
    args=parser.parse_args()
    previous=json.loads(args.data.read_text(encoding='utf-8'))
    policy=json.loads(args.policy.read_text(encoding='utf-8'))
    cache=json.loads(args.cache.read_text()) if args.cache.exists() else {}
    result, errors=collect(previous,policy,cache)
    save(args.data,args.script,result)
    args.cache.parent.mkdir(parents=True,exist_ok=True)
    args.cache.write_text(json.dumps(cache,indent=2),encoding='utf-8')
    print(f'Confirmed {len(result["papers"])} papers; {len(errors)} incomplete checks. No scores extracted.')
    for error in errors: print(error,file=sys.stderr)
    return 1 if errors else 0

if __name__=='__main__': sys.exit(main())
