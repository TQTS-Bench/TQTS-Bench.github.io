window.TQTS_DISCOVERY = {
  "schemaVersion": 1,
  "lastSuccessfulSync": "2026-10-02T08:26:52Z",
  "papers": [
    {
      "id": "2607.07073",
      "version": 1,
      "title": "ShapeTalk: Combining Natural Language and Sketch for Time-Series Pattern Querying",
      "abstract": "Searching for time-series segments that match user-defined patterns is important in domains such as finance, climate science, and healthcare. However, existing visual query tools often struggle to support vague, composite, or fuzzy pattern descriptions, often requiring users to express their intent through precise sketches or rigid structured filters. We present ShapeTalk, a coordinated natural-language and sketch-based querying system for univariate time-series pattern search. Rather than treating text and sketch as a fused input stream, ShapeTalk uses them as complementary representations of analytic intent: natural language supports semantic and compositional pattern descriptions, while sketching supports direct geometric refinement. The two modalities are linked through a shared visual context, editable feature representations, and synchronized result views, enabling users to move between text and sketch during iterative query formulation. At its core is an LLM-based semantic parsing pipeline that translates free-form natural-language queries into interpretable and editable shape-feature constraints. We evaluate ShapeTalk through two usage scenarios, a user study with failure-case analysis, and an assessment of the LLM-based semantic parsing pipeline. The results show that ShapeTalk supports effective time-series pattern search, with natural language serving as an accessible entry point and sketching providing a complementary mechanism for refinement and recovery when textual specifications are insufficient.",
      "authors": [
        "Guoruizhe Sun",
        "Yueqiao Chen",
        "Emily Guo",
        "Yutong Yao",
        "Dongyu Liu"
      ],
      "published": "2026-07-08T07:02:43Z",
      "updated": "2026-07-08T07:02:43Z",
      "url": "https://arxiv.org/abs/2607.07073",
      "codeUrl": null,
      "source": "auto-collected"
    },
    {
      "id": "2604.13048",
      "version": 1,
      "title": "From Natural Language to PromQL: A Catalog-Driven Framework with Dynamic Temporal Resolution for Cloud-Native Observability",
      "abstract": "Modern cloud-native platforms expose thousands of time series metrics through systems like Prometheus, yet formulating correct queries in domain-specific languages such as PromQL remains a significant barrier for platform engineers and site reliability teams. We present a catalog-driven framework that translates natural language questions into executable PromQL queries, bridging the gap between human intent and observability data. Our approach introduces three contributions: (1) a hybrid metrics catalog that combines a statically curated base of approximately 2,000 metrics with runtime discovery of hardware-specific signals across GPU vendors, (2) a multi-stage query pipeline with intent classification, category-aware metric routing, and multi-dimensional semantic scoring, and (3) a dynamic temporal resolution mechanism that interprets diverse natural language time expressions and maps them to appropriate PromQL duration syntax. We integrate the framework with the Model Context Protocol (MCP) to enable tool-augmented LLM interactions across multiple providers. The catalog-driven approach achieves sub-second metric discovery through pre-computed category indices, with the full pipeline completing in approximately 1.1 seconds via the catalog path. The system has been deployed on production Kubernetes clusters managing AI inference workloads, where it supports natural language querying across approximately 2,000 metrics spanning cluster health, GPU utilization, and model-serving performance.",
      "authors": [
        "Twinkll Sisodia"
      ],
      "published": "2026-03-15T18:48:15Z",
      "updated": "2026-03-15T18:48:15Z",
      "url": "https://arxiv.org/abs/2604.13048",
      "codeUrl": null,
      "source": "auto-collected"
    },
    {
      "id": "2603.00725",
      "version": 1,
      "title": "LaSTR: Language-Driven Time-Series Segment Retrieval",
      "abstract": "Effectively searching time-series data is essential for system analysis, but existing methods often require expert-designed similarity criteria or rely on global, series-level descriptions. We study language-driven segment retrieval: given a natural language query, the goal is to retrieve relevant local segments from large time-series repositories. We build large-scale segment--caption training data by applying TV2-based segmentation to LOTSA windows and generating segment descriptions with GPT-5.2, and then train a Conformer-based contrastive retriever in a shared text--time-series embedding space. On a held-out test split, we evaluate single-positive retrieval together with caption-side consistency (SBERT and VLM-as-a-judge) under multiple candidate pool sizes. Across all settings, LaSTR outperforms random and CLIP baselines, yielding improved ranking quality and stronger semantic agreement between retrieved segments and query intent.",
      "authors": [
        "Kota Dohi",
        "Harsh Purohit",
        "Tomoya Nishida",
        "Takashi Endo",
        "Yusuke Ohtsubo",
        "Koichiro Yawata",
        "Koki Takeshita",
        "Tatsuya Sasaki",
        "Yohei Kawaguchi"
      ],
      "published": "2026-02-28T16:15:02Z",
      "updated": "2026-02-28T16:15:02Z",
      "url": "https://arxiv.org/abs/2603.00725",
      "codeUrl": null,
      "source": "auto-collected"
    },
    {
      "id": "2602.17001",
      "version": 3,
      "title": "Sonar-TS: Search-Then-Verify Natural Language Querying for Time Series Databases",
      "abstract": "Natural Language Querying for Time Series Databases (NLQ4TSDB) aims to assist non-expert users retrieve meaningful events, intervals, and summaries from massive temporal records. However, existing Text-to-SQL methods are not designed for continuous morphological intents such as shapes or anomalies, while time series models struggle to handle ultra-long histories. To address these challenges, we propose Sonar-TS, a neuro-symbolic framework that tackles NLQ4TSDB via a Search-Then-Verify pipeline. Analogous to active sonar, it utilizes a feature index to ping candidate windows via SQL, followed by generated Python programs to lock on and verify candidates against raw signals. To enable effective evaluation, we introduce NLQTSBench, the first large-scale benchmark designed for NLQ over TSDB-scale histories. Our experiments highlight the unique challenges within this domain and demonstrate that Sonar-TS effectively navigates complex temporal queries where traditional methods fail. This work presents the first systematic study of NLQ4TSDB, offering a general framework and evaluation standard to facilitate future research.",
      "authors": [
        "Zhao Tan",
        "Yiji Zhao",
        "Shiyu Wang",
        "Chang Xu",
        "Yuxuan Liang",
        "Xiping Liu",
        "Shirui Pan",
        "Ming Jin"
      ],
      "published": "2026-02-19T01:51:52Z",
      "updated": "2026-06-10T12:34:11Z",
      "url": "https://arxiv.org/abs/2602.17001",
      "codeUrl": null,
      "source": "auto-collected"
    },
    {
      "id": "2503.03114",
      "version": 3,
      "title": "PromCopilot: Simplifying Prometheus Metric Querying in Cloud Native Online Service Systems via Large Language Models",
      "abstract": "With the increasing complexity of modern online service systems, understanding the state and behavior of the systems is essential for ensuring their reliability and stability. Therefore, metric monitoring systems are widely used and become an important infrastructure in online service systems. Engineers usually interact with metrics data by manually writing domain-specific language (DSL) queries to achieve various analysis objectives. However, writing these queries can be challenging and time-consuming, as it requires engineers to have high programming skills and understand the context of the system. In this paper, we focus on PromQL, which is the metric query DSL provided by the widely used metric monitoring system Prometheus. We aim to simplify metrics querying by enabling engineers to interact with metrics data in Prometheus through natural language, and we call this task text-to-PromQL. Building upon the insight, this paper proposes PromCopilot, a Large Language Model-based text-to-PromQL framework. PromCopilot first uses a knowledge graph to describe the complex context of a cloud native online service system. Then, through the synergistic reasoning of LLMs and the knowledge graph, PromCopilot transforms engineers' natural language questions into PromQL queries. To evaluate PromCopilot, we manually construct the first text-to-PromQL benchmark dataset which contains 280 metric query questions. The experiment results show that PromCopilot is effective in text-to-PromQL. When using GPT-4 as the backbone LLM, PromCopilot achieves an accuracy of 69.1\\% in translating natural language questions to PromQL queries when using. To the best of our knowledge, this paper is the first study of text-to-PromQL, and PromCopilot pioneered the DSL generation framework for metric querying and analysis.",
      "authors": [
        "Chenxi Zhang",
        "Bicheng Zhang",
        "Dingyu Yang",
        "Xin Peng",
        "Miao Chen",
        "Senyu Xie",
        "Gang Chen",
        "Wei Bi",
        "Wei Li"
      ],
      "published": "2025-03-05T02:22:01Z",
      "updated": "2026-03-11T16:58:48Z",
      "url": "https://arxiv.org/abs/2503.03114",
      "codeUrl": null,
      "source": "auto-collected"
    }
  ],
  "reportedResults": []
};
