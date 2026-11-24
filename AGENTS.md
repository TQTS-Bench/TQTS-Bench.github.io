# TQTS-Bench working agreement

- This is the local website checkout. The owner approved publication of design commit 709bb9d on 2026-11-25; publication is being restored.
- The 2026-11-25 approval authorizes publishing the reviewed version and its deployment configuration. Future design changes remain local until the user approves their preview; do not infer standing publication approval.
- Preserve anonymous review: no author names, affiliations, venue, private manuscript link, or manuscript source in served assets. The homepage Paper button stays disabled. Code links to https://anonymous.4open.science/r/TQTS-Bench-00CD.
- At the start of every editing conversation, inspect git status. Preserve any existing changes in a local checkpoint commit before new edits. Tag the starting commit with a unique before-round-YYYY-MM-DD-HHMM name. Never overwrite an existing tag.
- Commit each finished conversation locally with the anonymous identity TQTS-Bench <tqts-bench@users.noreply.github.com>. Tell the user the before/after commit or tag. Never reset --hard, clean, or rewrite history as routine recovery; inspect an old version on a new branch or use revert.
- Keep index.html as the research homepage; leaderboard.html as the two-tab leaderboard; submit.html as submission guidance.
- Verified scores come from results.js and the accompanying manuscript. Do not replace them with scraped estimates. Keep the static table in leaderboard.html consistent with results.js.
- Auto-collected contains evidence-linked papers only. Do not infer benchmark usage from general topical similarity, and do not extract or rank paper-reported scores. Exclude the benchmark's own paper and author metadata. A failed or incomplete scan must not advance lastSuccessfulSync.
- Keep daily collection independent from publication. Pages publication uses its own workflow, including after a completed daily collection run. Only public website assets belong in the Pages artifact.
- Check desktop/mobile layouts with the browser, local asset links, keyboard tab behavior, and collector regression tests after relevant changes.
