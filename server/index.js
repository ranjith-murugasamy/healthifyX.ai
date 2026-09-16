const express = require('express')
const cors = require('cors')

const app = express()
const port = process.env.API_PORT || process.env.PORT || 4000
app.use(cors())
app.use(express.json())

const baseWaveform = Array.from({ length: 50 }, (_, index) => {
  const beat = index % 12
  return beat === 5 ? 66 : beat === 6 ? 34 : 40 + Math.round(Math.sin(index * 1.7) * 7)
})

let sampleCount = 0

function createSummary() {
  sampleCount += 1
  const drift = Math.sin(sampleCount / 3)
  const heartRate = Math.round(72 + drift * 2)
  const temperature = (36.7 + drift * 0.05).toFixed(1)
  const respiration = Math.round(16 + drift)
  const hemoglobin = (13.4 + drift * 0.03).toFixed(1)

  return {
    updatedAt: new Date().toISOString(),
    status: 'Stable',
    statusMessage: 'All monitored signals are within the demo baseline.',
    metrics: [
      { label: 'Heart rate', value: String(heartRate), unit: 'BPM', trend: '+2.4%', tone: 'coral' },
      { label: 'Temperature', value: temperature, unit: '°C', trend: '-0.3%', tone: 'amber' },
      { label: 'Respiration', value: String(respiration), unit: 'breaths/min', trend: '+1.1%', tone: 'sky' },
      { label: 'Hb estimate', value: hemoglobin, unit: 'g/dL', trend: '+0.7%', tone: 'mint' },
    ],
    waveform: baseWaveform.map((value, index) => value + Math.round(Math.sin((sampleCount + index) / 4))),
    alerts: [
      { title: 'Blynk channel connected', detail: 'Mobile stream is receiving the latest sample', time: '2 min ago', tone: 'mint' },
      { title: 'Signal quality improved', detail: 'ECG and PPG contact is stable', time: '18 min ago', tone: 'sky' },
      { title: 'Daily check-in complete', detail: 'No action required for this demo session', time: '1 hr ago', tone: 'amber' },
    ],
    model: { name: 'Multimodal Random Forest', confidence: '94.8%', latency: '118 ms', features: ['ECG rhythm', 'PPG pulse', 'EMG activity', 'Respiration'] },
    evaluation: {
      validation: { method: 'Subject-independent split', subjects: 24, train: '19 subjects', test: '5 subjects', leakageGuard: 'No subject overlap' },
      models: [
        { name: 'SVM', accuracy: '88.4%', f1: '0.86', auc: '0.91', latency: '74 ms' },
        { name: 'Random Forest', accuracy: '92.1%', f1: '0.91', auc: '0.95', latency: '118 ms' },
        { name: 'XGBoost', accuracy: '93.5%', f1: '0.93', auc: '0.96', latency: '96 ms' },
        { name: 'ANN / 1D-CNN', accuracy: '94.2%', f1: '0.94', auc: '0.97', latency: '142 ms' },
        { name: 'CNN-LSTM', accuracy: '95.0%', f1: '0.95', auc: '0.98', latency: '186 ms' },
      ],
      fusion: [
        { name: 'ECG only', accuracy: '88.4%', f1: '0.86', auc: '0.91' },
        { name: 'PPG + ECG', accuracy: '90.8%', f1: '0.89', auc: '0.94' },
        { name: 'All five signals', accuracy: '95.0%', f1: '0.95', auc: '0.98' },
      ],
      hb: { mae: '0.42 g/dL', rmse: '0.61 g/dL', r2: '0.88', blandAltman: '±1.18 g/dL' },
      confusion: [[42, 3, 1], [4, 38, 2], [1, 3, 45]],
    },
  }
}

app.get('/api/health-summary', (_request, response) => {
  response.json(createSummary())
})

app.get('/api/health', (_request, response) => response.json({ ok: true, service: 'healthifyx-api' }))
app.listen(port, () => console.log(`HealthifyX API listening on http://localhost:${port}`))