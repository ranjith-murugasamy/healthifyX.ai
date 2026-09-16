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

## Technical FAQ

### What is the application architecture?

The frontend is a React 19 and TypeScript application built with Vite. Tailwind CSS is available through the Vite plugin, while the dashboard's visual system is defined in `client/src/index.css`. The backend is a small Express service in `server/index.js`. Vite proxies `/api` requests from port `5173` to the API on port `4000` by default.

### Which API endpoints are available?

`GET /api/health` returns a service health response. `GET /api/health-summary` returns the current demo metrics, waveform points, alerts, model state, and evaluation data. The response is generated in memory and does not persist measurements.

### How does the live stream work currently?

When streaming is enabled, the React client requests `/api/health-summary` immediately and then every five seconds. The server produces deterministic simulated variation for heart rate, temperature, respiration, Hb estimate, and waveform values. Pause stops the polling interval; resume starts it again.

### How should ESP32 data be integrated?

Add a server-side serial ingestion boundary that reads the ESP32 stream at 115200 baud, validates each record, and maps it to the dashboard contract returned by `/api/health-summary`. Keep serial access on the server, not in the browser. Replace the simulated `createSummary()` source only after buffering, timestamping, signal-quality checks, and disconnect handling are defined.

### Where should model inference run?

Inference should run behind the Node API or a dedicated Python inference service. The browser should receive validated predictions and metrics, not model files or raw credentials. A production integration should version the model, record its feature schema, return inference latency, and expose a clear unavailable-model state.

### How are the model comparison values generated?

The current SVM, Random Forest, XGBoost, ANN/1D-CNN, and CNN-LSTM values are representative demo data stored in the API response. They are not produced by training code. Replace them with results generated from reproducible experiments using the same subject-independent split and documented feature pipeline.

### How should subject-independent splitting be implemented?

Split by `subject_id` before feature scaling, oversampling, or model fitting. Fit preprocessing only on training subjects, then apply the fitted transformation to held-out subjects. Keep sessions from one subject in a single partition and persist the split manifest so experiments can be reproduced.

### What does the dataset loader validate?

The browser loader accepts a CSV with a header row or a JSON array. It currently confirms that a non-empty collection of rows can be parsed and reports the filename and row count. It does not yet enforce numeric ranges, required column names, duplicate timestamps, missing values, or subject leakage; those checks belong in the future training pipeline.

### Why is the dataset loader client-side?

It keeps the prototype private and easy to demonstrate: the selected file is read with the browser `FileReader` API and is not sent to the Express API. For production use, add authenticated upload, encryption, retention rules, audit logging, consent controls, and strict PHI handling before accepting real health data.

### How do themes work?

The theme toggle stores `dark` or `light` in `localStorage` under `healthifyx-theme` and writes the value to `document.documentElement.dataset.theme`. CSS selectors scoped to `html[data-theme='light']` provide the daylight palette; the default palette is vibrant midnight.

### How do I run the frontend and API separately?

Run `npm run dev` or `npm run start` for the managed two-process workflow. To run them manually, use `node server/index.js` for the API and `npm run dev --prefix client` for Vite. Set `API_PORT=4001` when port 4000 is occupied; the start script passes the matching port to the Vite API proxy.

### How are processes stopped?

The root start script writes child process IDs to `.healthifyx-dev.json`. `npm run stop` reads that file and sends a terminate signal only to those managed processes, avoiding unrelated local Node services.

### What should be tested before connecting real sensors?

Test the API contract, malformed payload handling, missing sensor values, stale timestamps, sensor disconnects, subject-independent split integrity, metric calculations, inference latency, and responsive dashboard states. Add integration tests before replacing the deterministic demo stream with live biomedical data.

## AI model FAQ

### What prediction tasks does HealthifyX support?

The planned tasks are ECG abnormality or arrhythmia classification, PPG-based non-invasive Hb estimation, EMG stress or fatigue classification, abnormal breathing detection, and multimodal physiological-state classification. The current UI demonstrates these task categories but does not execute trained biomedical models.

### Why compare several model families?

SVM provides a strong classical baseline for engineered features. Random Forest handles noisy, non-linear tabular features and is easy to inspect. XGBoost provides boosted-tree performance for structured features. ANN and 1D-CNN models can learn non-linear signal patterns, while CNN-LSTM can combine local waveform structure with temporal context. The best model must be selected from measured validation results, not assumed from the leaderboard.

### What is the expected input to an AI model?

The model input should be a validated feature window derived from ECG, PPG, EMG, respiration, heart rate, and temperature. Store the sampling rate, window duration, preprocessing version, feature names, and units with each experiment. Raw values should not be sent directly to a model unless the model was trained on the same raw-signal representation.

### How should preprocessing be handled?

Apply signal-quality checks, missing-value handling, filtering, normalization, and feature extraction in a versioned pipeline. Fit scalers, imputers, feature selectors, and oversampling steps using training subjects only. Reuse that fitted pipeline unchanged during validation and live inference.

### What is the difference between training and inference?

Training learns model parameters from labeled subject data and produces a versioned artifact. Inference applies that artifact to a new signal window and returns a prediction, confidence, latency, and optional explanation. The dashboard currently displays demo inference values; it does not train models in the browser.

### How should classification confidence be displayed?

Show the predicted class together with calibrated confidence and the model version. Confidence is not a probability of medical correctness. Add an uncertain or insufficient-signal state when signal quality is poor or confidence falls below a validated operating threshold.

### What does the confusion matrix represent?

The matrix compares ground-truth labels with predicted stable, stress, and fatigue classes. Diagonal cells are correct predictions; off-diagonal cells show which classes are confused. Report the class order, support count, normalization method, and held-out subject set beside the matrix.

### Why are ROC-AUC and F1 both needed?

ROC-AUC measures ranking quality across classification thresholds, while F1 balances precision and recall at a selected threshold. ROC-AUC can look strong with imbalanced data, so it should be reported alongside per-class precision, recall, F1, support, and preferably a precision-recall curve for rare events.

### Which metrics are used for Hb estimation?

MAE reports average absolute error, RMSE penalizes larger errors, and R² describes explained variance relative to a baseline. Bland-Altman analysis shows bias and agreement limits across the measurement range. These metrics require a defined reference Hb measurement and must not be presented as clinically validated without appropriate study design.

### How does multimodal fusion work?

The planned comparison starts with individual-signal inputs, then adds combinations such as ECG plus PPG, and finally fuses ECG, PPG, EMG, respiration, and temperature features. Compare the same subject-independent folds, preprocessing rules, and target labels so any improvement can be attributed to the added modalities.

### What is explainable AI in this project?

For tree models, feature importance or SHAP values can show how signal features contributed to a prediction. For neural networks, use an appropriate time-series attribution method and display it as supporting evidence, not as a causal explanation. Explanations should include the model version and feature units and should never imply a diagnosis.

### How should real-time latency be measured?

Measure from the end of an accepted signal window to the returned prediction, including preprocessing, model inference, serialization, and network transfer when applicable. Report median and tail latency over repeated windows, along with device, model version, window size, and sampling rate.

### How can AI alerts be made safer?

Use signal-quality gates, persistence across multiple windows, configurable thresholds, cooldown periods, and an explicit sensor-disconnected state. Alerts should say that a pattern was detected and recommend appropriate professional review when relevant; they should not claim that a disease was diagnosed.

### Can the model learn from the dashboard dataset picker?

Not currently. The picker reads a local file and reports its shape only. A future training workflow should validate the schema, label quality, subject partitions, units, missingness, and consent status before creating a training artifact. Training should be an explicit server or offline pipeline action, never an accidental side effect of opening the dashboard.

### How should model versions be tracked?

Record a model ID, algorithm, training dataset hash, subject split manifest, preprocessing version, feature schema, code revision, metrics, and training date. Include the model ID in every prediction and alert event so results can be audited and reproduced.

..
