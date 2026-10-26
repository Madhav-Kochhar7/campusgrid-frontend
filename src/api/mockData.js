/**
 * Mock Data Repository for Pure Frontend Mode
 * ===========================================
 * Provides realistic, comprehensive mock data for CampusGrid:
 * - Distributed compute nodes with telemetry, hardware specs, and locations.
 * - Varied compute jobs (Running, Completed, Queued, Failed).
 * - Sharded workloads with parallel chunk states.
 * - Interactive storage synchronized via browser localStorage.
 */

export const MOCK_NODES = [
  {
    id: 'node-beta-02',
    hostname: 'hpc-cluster-node-02',
    status: 'busy',
    cpu_cores: 32,
    cpu_usage: 84,
    ram_mb: 65536,
    ram_usage: 72,
    gpu: 'NVIDIA A100-SXM4 (40GB)',
    location: 'HPC Center - Rack 4',
    last_heartbeat: new Date().toISOString(),
  },
  {
    id: 'node-alpha-01',
    hostname: 'cs-lab3-rig-01',
    status: 'busy',
    cpu_cores: 16,
    cpu_usage: 68,
    ram_mb: 32768,
    ram_usage: 58,
    gpu: 'NVIDIA GeForce RTX 4090',
    location: 'CS Lab 3 - Station 12',
    last_heartbeat: new Date().toISOString(),
  },
  {
    id: 'node-delta-04',
    hostname: 'ai-annex-mac-studio',
    status: 'busy',
    cpu_cores: 24,
    cpu_usage: 52,
    ram_mb: 65536,
    ram_usage: 41,
    gpu: 'Apple M2 Ultra (60-Core Metal)',
    location: 'AI Research Annex',
    last_heartbeat: new Date().toISOString(),
  },
  {
    id: 'node-gamma-03',
    hostname: 'library-commons-08',
    status: 'online',
    cpu_cores: 8,
    cpu_usage: 14,
    ram_mb: 16384,
    ram_usage: 24,
    gpu: 'Intel Iris Xe Graphics',
    location: 'Central Library Level 2',
    last_heartbeat: new Date().toISOString(),
  },
  {
    id: 'node-epsilon-05',
    hostname: 'dell-poweredge-r750',
    status: 'online',
    cpu_cores: 48,
    cpu_usage: 22,
    ram_mb: 131072,
    ram_usage: 30,
    gpu: 'NVIDIA RTX A6000',
    location: 'Engineering Server Room B',
    last_heartbeat: new Date().toISOString(),
  },
  {
    id: 'node-zeta-06',
    hostname: 'robotics-edge-03',
    status: 'online',
    cpu_cores: 16,
    cpu_usage: 29,
    ram_mb: 32768,
    ram_usage: 35,
    gpu: 'NVIDIA RTX 3080 Ti',
    location: 'Robotics Lab - Bench 4',
    last_heartbeat: new Date().toISOString(),
  },
]

export const INITIAL_MOCK_JOBS = [
  {
    id: '7a3f89e2-4b10-4821-992a-fa103b4e1011',
    image: 'pytorch/pytorch:2.2.0-cuda12.1-cudnn8',
    status: 'running',
    cpu: 8,
    memory: '16g',
    gpu: true,
    node_id: 'node-beta-02',
    created_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    timeout_seconds: 7200,
    total_chunks: 4,
    split_by: { strategy: 'distributed', num_chunks: 4 },
    chunks: [
      { chunk_index: 0, status: 'done', node_id: 'node-alpha-01', params: { CHUNK_START: 0, CHUNK_END: 25000 } },
      { chunk_index: 1, status: 'running', node_id: 'node-beta-02', params: { CHUNK_START: 25000, CHUNK_END: 50000 } },
      { chunk_index: 2, status: 'running', node_id: 'node-delta-04', params: { CHUNK_START: 50000, CHUNK_END: 75000 } },
      { chunk_index: 3, status: 'pending', node_id: 'node-alpha-01', params: { CHUNK_START: 75000, CHUNK_END: 100000 } },
    ],
    logs: [
      '[INFO] 14:02:11 Container initialized on node-beta-02 (IP 10.24.18.92)',
      '[INFO] 14:02:14 Mounted storage volume /campusgrid/data/imagenet_subset -> /workspace/data',
      '[CUDA] 14:02:15 Detected NVIDIA A100-SXM4-40GB. Driver: 535.104.05. CUDA Version: 12.1',
      '[TRAIN] 14:02:18 Epoch 1/20 - loss: 1.4285 - acc: 0.5420 - val_loss: 1.2104 - val_acc: 0.6180',
      '[TRAIN] 14:06:30 Epoch 2/20 - loss: 1.0921 - acc: 0.6580 - val_loss: 0.9842 - val_acc: 0.7012',
      '[TRAIN] 14:10:45 Epoch 3/20 - loss: 0.8710 - acc: 0.7410 - val_loss: 0.8120 - val_acc: 0.7650',
      '[INFO] 14:12:50 Shard 0 synchronization complete. Shard checkpoint saved to /workspace/output/chkpt_03.pt',
      '[METRICS] 14:14:12 Throughput: 1,420 samples/sec | Memory utilized: 11.4GB / 16GB',
    ],
  },
  {
    id: '9b2c41d0-1c39-4972-8802-cb729a8f2022',
    image: 'python:3.11-slim-data-pipeline',
    status: 'running',
    cpu: 4,
    memory: '8g',
    gpu: false,
    node_id: 'node-alpha-01',
    created_at: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
    timeout_seconds: 3600,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[SETUP] Pulling base image python:3.11-slim (sha256:d82e1...)',
      '[INFO] Installing dependencies from requirements.txt: pandas, numpy, scikit-learn, scipy',
      '[PIPELINE] Processing telemetry batch 4,192 / 8,000...',
      '[PIPELINE] Extracted 42 features across 1.2M rows.',
      '[INFO] Streaming computed aggregates to local parquet buffer...',
      '[STREAM] Batch 4,800 completed in 3.12s. Zero schema anomalies detected.',
    ],
  },
  {
    id: '3e81a0ff-5a82-4110-9182-ed147a6b3033',
    image: 'blender:render-worker-v3',
    status: 'running',
    cpu: 4,
    memory: '8g',
    gpu: true,
    node_id: 'node-delta-04',
    created_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
    timeout_seconds: 1800,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[BLENDER] Initialized OptiX render engine on Apple M2 Ultra Metal backend.',
      '[RENDER] Scene: architectural_walkthrough_4k.blend loaded.',
      '[RENDER] Frame 104/300 rendered in 3.42s (Samples: 512/512)',
      '[RENDER] Frame 105/300 rendered in 3.39s (Samples: 512/512)',
      '[INFO] Syncing output tiles to shared artifact cache...',
    ],
  },
  {
    id: '4f1092de-77e1-4c55-b508-aa924d5e4044',
    image: 'blast/bioinformatics:2.14',
    status: 'done',
    cpu: 8,
    memory: '16g',
    gpu: false,
    node_id: 'node-epsilon-05',
    created_at: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    timeout_seconds: 7200,
    total_chunks: 3,
    split_by: { strategy: 'distributed', num_chunks: 3 },
    chunks: [
      { chunk_index: 0, status: 'done', node_id: 'node-alpha-01', params: { GENOME_SEQ: 'A_001' } },
      { chunk_index: 1, status: 'done', node_id: 'node-epsilon-05', params: { GENOME_SEQ: 'A_002' } },
      { chunk_index: 2, status: 'done', node_id: 'node-gamma-03', params: { GENOME_SEQ: 'A_003' } },
    ],
    logs: [
      '[NCBI BLAST+] Query: 14,200 nucleotide sequences loaded from FASTA.',
      '[ALIGN] Searching database NCBI-RefSeq-108 against query shards...',
      '[INFO] 14,198 high-scoring segment pairs (HSPs) identified.',
      '[EXPORT] Output formatted into tabular ASN.1 and TSV format.',
      '[SUCCESS] Job exited with status 0 in 53m 12s. Artifacts compressed into results_4f1092de.zip.',
    ],
  },
  {
    id: '88a21bc9-20f4-41e9-9fa9-cc603e8a5055',
    image: 'tensorflow/tensorflow:2.15-gpu',
    status: 'done',
    cpu: 4,
    memory: '8g',
    gpu: true,
    node_id: 'node-beta-02',
    created_at: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 145 * 60 * 1000).toISOString(),
    timeout_seconds: 3600,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[TF] Device mapping: /GPU:0 -> NVIDIA A100-SXM4',
      '[TRAIN] Finished fine-tuning BERT-base-uncased. Validation Accuracy: 94.6%',
      '[EVAL] Confusion matrix and model weights exported to /output/model.onnx',
      '[SUCCESS] Execution terminated normally. Process exit 0.',
    ],
  },
  {
    id: '66e098cb-31d7-463e-bf5a-dd120c4b6066',
    image: 'node:20-alpine-puppeteer-crawler',
    status: 'done',
    cpu: 2,
    memory: '4g',
    gpu: false,
    node_id: 'node-gamma-03',
    created_at: new Date(Date.now() - 320 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 290 * 60 * 1000).toISOString(),
    timeout_seconds: 3600,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[CRAWLER] Headless Chromium launched in sandbox mode.',
      '[CRAWLER] Scraped 4,500 open-access research papers from arXiv API.',
      '[PARSER] Extracted citations, titles, abstracts, and author affiliations.',
      '[SUCCESS] Ingested 32MB structured dataset into SQLite archive.',
    ],
  },
  {
    id: '11c504aa-89e4-44a1-b873-ea8491027077',
    image: 'r-base:4.3.2-bioconductor',
    status: 'done',
    cpu: 4,
    memory: '8g',
    gpu: false,
    node_id: 'node-zeta-06',
    created_at: new Date(Date.now() - 480 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 440 * 60 * 1000).toISOString(),
    timeout_seconds: 3600,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[Rscript] Loaded DESeq2, ggplot2, pheatmap packages.',
      '[ANALYSIS] Differential gene expression calculated across 48 RNA-seq samples.',
      '[PLOT] Volcano plot and PCA cluster maps generated to /output/plots.pdf.',
      '[SUCCESS] Analysis completed with 0 errors.',
    ],
  },
  {
    id: '55d88210-90c1-4872-91e2-bb1928378088',
    image: 'rust:1.75-monte-carlo-sim',
    status: 'done',
    cpu: 8,
    memory: '16g',
    gpu: false,
    node_id: 'node-alpha-01',
    created_at: new Date(Date.now() - 680 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 655 * 60 * 1000).toISOString(),
    timeout_seconds: 3600,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[CARGO] Compiled release target with AVX2 vectorized math.',
      '[SIMULATION] Executing 100,000,000 iterations for stochastic thermodynamic model.',
      '[RESULTS] Convergence reached after 4m 18s. Variance < 0.00001.',
      '[SUCCESS] Results recorded to simulation_output.csv.',
    ],
  },
  {
    id: '22bf9100-64a8-4444-a128-cc9910289099',
    image: 'qiskit/quantum-circuit-sim:0.45',
    status: 'queued',
    cpu: 4,
    memory: '8g',
    gpu: false,
    node_id: null,
    created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    timeout_seconds: 3600,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[QUEUE] Workload registered in orchestrator broker.',
      '[SCHEDULER] Awaiting available worker node matching resource profile (4 CPU / 8GB RAM)...',
      '[STATUS] Position in dispatch queue: #1',
    ],
  },
  {
    id: '00ef1294-81d3-4819-bf71-dd8172901000',
    image: 'custom/c-cuda-fluid-sim:v1',
    status: 'failed',
    cpu: 8,
    memory: '16g',
    gpu: true,
    node_id: 'node-zeta-06',
    created_at: new Date(Date.now() - 920 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 912 * 60 * 1000).toISOString(),
    timeout_seconds: 1800,
    total_chunks: null,
    split_by: null,
    chunks: [],
    logs: [
      '[EXEC] Launching Navier-Stokes 3D grid solver on GPU device...',
      '[ALLOC] Requesting 14.8GB GPU VRAM allocation...',
      '[ERROR] CUDA out of memory. Tried to allocate 4.20 GiB (GPU 0; 10.00 GiB total capacity; 7.82 GiB already allocated)',
      '[FATAL] Process received SIGABRT (exit code 134).',
      '[STATUS] Workload failed with execution error. Retry available with lower grid resolution.',
    ],
  },
]

const STORAGE_KEY = 'campusgrid_mock_jobs'

/**
 * Retrieves the current collection of jobs from browser localStorage.
 * Initializes with the default seed set if empty.
 */
export function getStoredJobs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to parse mock jobs from storage, falling back to default seed', e)
  }
  // Initialize default seed
  saveStoredJobs(INITIAL_MOCK_JOBS)
  return INITIAL_MOCK_JOBS
}

/**
 * Persists the jobs array to browser localStorage.
 */
export function saveStoredJobs(jobs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs))
  } catch (e) {
    console.error('Failed to save mock jobs to storage', e)
  }
}

/**
 * Creates and registers a new mock job.
 */
export function addMockJob(payload) {
  const jobs = getStoredJobs()
  const randomHex = () => Math.random().toString(16).substring(2, 6)
  const id = `${randomHex()}${randomHex()}-${randomHex()}-4${randomHex().substring(0,3)}-8${randomHex().substring(0,3)}-${randomHex()}${randomHex()}`
  
  const assignedNode = MOCK_NODES[Math.floor(Math.random() * MOCK_NODES.length)]
  const numChunks = payload.split_by?.num_chunks || null

  let chunks = []
  if (numChunks) {
    chunks = Array.from({ length: numChunks }).map((_, idx) => ({
      chunk_index: idx,
      status: idx === 0 ? 'running' : 'pending',
      node_id: MOCK_NODES[idx % MOCK_NODES.length].id,
      params: { CHUNK_START: idx * 10000, CHUNK_END: (idx + 1) * 10000 },
    }))
  }

  const newJob = {
    id,
    image: payload.image || 'ubuntu:22.04',
    status: 'running',
    cpu: payload.cpu || 2,
    memory: payload.memory || '4g',
    gpu: Boolean(payload.gpu),
    node_id: assignedNode.id,
    created_at: new Date().toISOString(),
    timeout_seconds: payload.timeout_seconds || 3600,
    total_chunks: numChunks,
    split_by: payload.split_by || null,
    chunks,
    logs: [
      `[SCHEDULER] Job ${id.slice(0, 8)} accepted by orchestrator.`,
      `[ROUTING] Allocated to active worker node: ${assignedNode.hostname} (${assignedNode.id})`,
      `[CONTAINER] Pulling runtime container image: ${payload.image}`,
      `[RESOURCE] Allocated ${payload.cpu || 2} CPU cores, ${payload.memory || '4g'} RAM (GPU: ${payload.gpu ? 'Enabled' : 'Disabled'})`,
      `[EXEC] Process initialized with PID 14092. Streaming execution telemetry...`,
    ],
  }

  const updated = [newJob, ...jobs]
  saveStoredJobs(updated)
  return newJob
}

/**
 * Removes a job by ID from local storage.
 */
export function deleteMockJob(id) {
  const jobs = getStoredJobs()
  const updated = jobs.filter((j) => j.id !== id)
  saveStoredJobs(updated)
  return { success: true }
}

/**
 * Retrieves a single job by ID.
 */
export function getMockJob(id) {
  const jobs = getStoredJobs()
  return jobs.find((j) => j.id === id) || null
}
