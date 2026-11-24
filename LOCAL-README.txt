TQTS-Bench local redesign, 2026-11-25

Preview
  Run preview.cmd in this folder, then open http://127.0.0.1:8765/.
  Homepage: index.html
  Scores: leaderboard.html
  Submission guidance: submit.html

Privacy
  Owner approved publication of reviewed design 709bb9d on 2026-11-25.
  Subsequent design changes still require preview approval before publishing.
  Paper button disabled. Anonymous Code URL retained.
  Manuscript source remains outside this checkout; only the pipeline figure was rasterized for the site.

Version history
  Starting version: before-redesign-2026-11-25 (60c8aef)
  Work branch: redesign/2026-11-25
  Finished version: redesign-round-1-2026-11-25
  Inspect the starting version safely, after saving any current edits:
    git switch -c inspect-original before-redesign-2026-11-25
  Return to the redesign:
    git switch redesign/2026-11-25
  For a permanent undo, use git revert on the redesign commit rather than deleting history.

Paper discovery audit
  The old data had lastSuccessfulSync=2026-11-24T10:53:57Z, so collection had not simply stopped.
  Publication dates were old because they belonged to the source papers, not the last sync.
  The old script selected broad text-to-query/time-series literature and only extracted scores when
  an abstract contained a narrowly phrased overall-EX claim. These are different from benchmark-linked papers.
  The old workflow coupled collection to Pages deployment; private/free Pages would now be unavailable.

New behavior
  arXiv metadata queries discover candidates; arXiv HTML/PDF and the Papers With Code read API
  provide public full text for evidence checks. Records use canonical arXiv IDs and versions.
  No model-inferred scores or author lists. Existing unrelated records are not grandfathered in.
  Negative evidence checks are cached for seven days; changed versions are checked immediately.
  Complete scans record lastSuccessfulSync. Failures preserve confirmed records and the previous
  successful timestamp, expose failure status, and fail the scheduled job visibly.
  Daily schedule: 01:17 UTC (09:17 China time). The updated collection workflow is included in the approved publication.
  First live scan checked 12 candidate papers and confirmed 0 benchmark-linked papers.

Coverage limits
  Candidate discovery uses metadata keyword queries with a two-year lookback, not an exhaustive
  citation graph. References in papers outside those candidates can be missed. No public TQTS paper
  identifier is configured during anonymous review. After publication, adding a public DOI/arXiv ID
  to a citation-index query can extend recall. Unavailable full text is reported as an incomplete check.

Checks
  python -m unittest discover -s tests -v
  node --check app.js
  The static HTML table is validated against results.js during this round.

Publication
  Owner approval received on 2026-11-25. pages.yml publishes website assets separately from daily collection.
  Restore the exact approved visual version using tag approved-design-2026-11-25 (709bb9d).
  Do not publish this README, AGENTS.md, tests, Python code, or Git metadata as website artifacts.

References
  https://lambertae.github.io/projects/drifting/
  https://spatialvla.github.io/
  https://chartgalaxy.github.io/#overview
  https://spider2-sql.github.io/
  https://bird-bench.github.io/
  https://huggingface.co/spaces/huggingface/paperswithcode
  https://huggingface.co/spaces/huggingface/paperswithcode/raw/main/llms.txt
