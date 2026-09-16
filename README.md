# HealthifyX

HealthifyX is a research-oriented multimodal health monitoring dashboard based on the supplied ESP32, ECG, PPG, EMG, acoustic respiration, and DS18B20 requirements.

The current application is a full-stack demo slice:

- `client/`: React + TypeScript + Vite + Tailwind CSS dashboard.
- `server/`: Express API serving demo-safe health summary data.
- `scripts/`: managed local start and stop commands.
- `docs/`: source requirement papers.

## Run locally

```bash
npm install
npm install --prefix client
npm run dev
```

Open `http://localhost:5173` for the dashboard. The API is available at `http://localhost:4000/api/health-summary` and `http://localhost:4000/api/health`. Set `API_PORT=4001 npm run dev` when port 4000 is already in use.

Stop both managed processes with:

```bash
npm run stop
```

Other commands:

```bash
npm run build
npm test
```

`npm run build` creates the production client bundle in `client/dist`. `npm test` performs JavaScript syntax checks for the API and process scripts.

## Product scope

The dashboard covers live/demo vitals, an ECG waveform view, multimodal model interpretation, signal-feature contributions, recent alert activity, Blynk connection status, and a research evaluation workspace. The evaluation view compares SVM, Random Forest, XGBoost, ANN/1D-CNN, and CNN-LSTM; contrasts individual signals with multimodal fusion; shows classification accuracy, F1, ROC-AUC, latency, and a confusion matrix; reports Hb MAE, RMSE, R², and Bland-Altman spread; and displays subject-independent train/test validation. Values are explicitly demo estimates and are not clinical measurements or diagnoses.

The API currently uses a deterministic simulated stream that refreshes while the dashboard is in streaming mode. The next integration boundary is the ESP32 serial stream at 115200 baud, followed by validated model inference and real Blynk/email adapters. Research results should be populated only from real subject-independent evaluations and should report the metrics specified in the AI/ML add-on requirements.

## Dataset input and snapshots

The checked-in sample dataset is available at `input/sample-multimodal-health.csv`. It contains 15 demo observations across five subjects with ECG, PPG, EMG, respiration, heart rate, temperature, Hb estimate, and physiological-state fields. The evaluation dialog accepts a local `.csv` file with a header row or a `.json` file containing an array of records and reports the loaded filename and row count. Loading a file previews its shape in the UI; it does not train a model or upload data to a server.

Generated visual artifacts are stored in `output/`:

- `output/healthifyx-dashboard.png`: dashboard snapshot.
- `output/healthifyx-evaluation-workspace.png`: evaluation view with dataset and metrics.

## FAQs

### How do I load a custom dataset?

Open **Model readiness**, choose **Open evaluation**, then use **Choose CSV / JSON**. The file is parsed locally in the browser and the filename and row count are shown in the evaluation workspace.

### What columns should a CSV contain?

Use the sample file as a template. Recommended fields are `subject_id`, `session_id`, `timestamp`, `ecg_signal`, `ppg_signal`, `emg_activity`, `respiration_amplitude`, `heart_rate_bpm`, `temperature_c`, `hemoglobin_estimate_g_dl`, and `physiological_state`.

### Does loading a dataset train or evaluate a model?

No. The current loader validates the file shape and displays its size only. The evaluation metrics in this prototype are demo values and must be replaced by measured results from a real training pipeline before research conclusions are made.

### What does subject-independent validation mean?

All rows from a subject stay in one partition. For example, a subject assigned to the test set must not also appear in training rows. This helps prevent subject leakage and gives a more honest estimate of generalization.

### Which metrics are represented?

Classification uses accuracy, F1, ROC-AUC, latency, and a stable/stress/fatigue confusion matrix. Hb regression uses MAE, RMSE, R², and Bland-Altman spread. Individual signal and multimodal fusion comparisons are shown together.

### Is this a clinical diagnostic tool?

No. HealthifyX is an educational and research prototype. Its values are estimates or demo data and are not a diagnosis, treatment recommendation, or substitute for professional medical care.

### Is custom health data uploaded anywhere?

The current file picker reads the selected CSV or JSON locally in the browser and does not send it to the API. Do not use identifiable health information in demos, screenshots, logs, or shared project files.

### Where are the generated snapshots stored?

They are stored in the project-level `output/` directory so they can be reviewed or attached to project documentation.
