/* Baselines from Table 1; reviewed submissions are added separately. */
window.TQTS_RESULTS = {
  "source": "Table 1 of the accompanying paper",
  "metric": "Execution Accuracy (EX, %)",
  "methodBackbone": "GPT-4o-mini",
  "reportingDate": "2026-09-28",
  "reportingDateLabel": "Sep 28, 2026",
  "reportingTimezone": "UTC",
  "reportingDeadline": "2026-09-28",
  "reportingDateBasis": "Initial leaderboard publication date, not an experiment execution timestamp.",
  "entries": [
    {
      "name": "Qwen3.8-Flash",
      "type": "model",
      "group": "Open-source model",
      "easy": 43.75,
      "medium": 20.07,
      "hard": 17.79,
      "overall": 27.04,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "DeepSeek-V4-Pro",
      "type": "model",
      "group": "Open-source model",
      "easy": 39.89,
      "medium": 15.87,
      "hard": 11.79,
      "overall": 22.51,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "GLM-5.3-Flash",
      "type": "model",
      "group": "Open-source model",
      "easy": 54.3,
      "medium": 28.88,
      "hard": 19.15,
      "overall": 34.61,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "Kimi-K3",
      "type": "model",
      "group": "Open-source model",
      "easy": 58.26,
      "medium": 37.24,
      "hard": 34.08,
      "overall": 43.15,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "GPT-6-Sol",
      "type": "model",
      "group": "Closed-source model",
      "easy": 62.74,
      "medium": 40.63,
      "hard": 35.38,
      "overall": 46.38,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "Claude-Opus-5",
      "type": "model",
      "group": "Closed-source model",
      "easy": 62.79,
      "medium": 42.91,
      "hard": 41.92,
      "overall": 48.98,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "Gemini-3.7-Flash",
      "type": "model",
      "group": "Closed-source model",
      "easy": 63.25,
      "medium": 37.68,
      "hard": 32.92,
      "overall": 44.65,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "DeepEye-SQL",
      "type": "method",
      "group": "RDB method",
      "projectUrl": "https://github.com/HKUSTDial/DeepEye-SQL#readme",
      "easy": 14.82,
      "medium": 1.92,
      "hard": 1.16,
      "overall": 5.83,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "OpenSearch-SQL",
      "type": "method",
      "group": "RDB method",
      "projectUrl": "https://github.com/OpenSearch-AI/OpenSearch-SQL#readme",
      "easy": 16.37,
      "medium": 1.84,
      "hard": 1.09,
      "overall": 6.27,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "RSL-SQL",
      "type": "method",
      "group": "RDB method",
      "projectUrl": "https://github.com/Laqcce-cao/RSL-SQL#readme",
      "easy": 11.99,
      "medium": 1.33,
      "hard": 0.95,
      "overall": 4.62,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "DAIL-SQL",
      "type": "method",
      "group": "RDB method",
      "projectUrl": "https://github.com/BeachWang/DAIL-SQL#readme",
      "easy": 1.34,
      "medium": 0.26,
      "hard": 0,
      "overall": 0.54,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "DIN-SQL",
      "type": "method",
      "group": "RDB method",
      "projectUrl": "https://github.com/MohammadrezaPourreza/Few-shot-NL2SQL-with-prompting#readme",
      "easy": 12.25,
      "medium": 2.17,
      "hard": 1.23,
      "overall": 5.14,
      "source": "benchmark-baseline",
      "verification": "verified"
    },
    {
      "name": "PromCopilot",
      "type": "method",
      "group": "TSDB method",
      "projectUrl": "https://github.com/FudanSELab/PromCopilot#readme",
      "easy": 1.8,
      "medium": 0.22,
      "hard": 0.07,
      "overall": 0.69,
      "source": "benchmark-baseline",
      "verification": "verified"
    }
  ],
  "human": {
    "easy": 95.71,
    "medium": 85.52,
    "hard": 81.94,
    "overall": 87.34,
    "sample": "Randomly sampled 10% subset"
  }
};
