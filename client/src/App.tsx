import { useEffect, useState } from 'react'
import {
  Activity,
  Bell,
  BrainCircuit,
  ChevronDown,
  CircleHelp,
  Cloud,
  Droplets,
  HeartPulse,
  Menu,
  MoreHorizontal,
  MoveRight,
  Moon,
  Radio,
  ShieldCheck,
  Sun,
  Thermometer,
  Wind,
  X,
  Zap,
} from 'lucide-react'

type HealthSummary = {
  updatedAt: string
  status: string
  statusMessage: string
  metrics: { label: string; value: string; unit: string; trend: string; tone: string }[]
  waveform: number[]
  alerts: { title: string; detail: string; time: string; tone: string }[]
  model: { name: string; confidence: string; latency: string; features: string[] }
  evaluation: {
    validation: { method: string; subjects: number; train: string; test: string; leakageGuard: string }
    models: { name: string; accuracy: string; f1: string; auc: string; latency: string }[]
    fusion: { name: string; accuracy: string; f1: string; auc: string }[]
    hb: { mae: string; rmse: string; r2: string; blandAltman: string }
    confusion: number[][]
  }
}

const fallbackSummary: HealthSummary = {
  updatedAt: 'Just now',
  status: 'Stable',
  statusMessage: 'All monitored signals are within the demo baseline.',
  metrics: [
    { label: 'Heart rate', value: '72', unit: 'BPM', trend: '+2.4%', tone: 'coral' },
    { label: 'Temperature', value: '36.7', unit: '°C', trend: '-0.3%', tone: 'amber' },
    { label: 'Respiration', value: '16', unit: 'breaths/min', trend: '+1.1%', tone: 'sky' },
    { label: 'Hb estimate', value: '13.4', unit: 'g/dL', trend: '+0.7%', tone: 'mint' },
  ],
  waveform: [38, 44, 39, 52, 40, 66, 34, 42, 37, 55, 35, 46, 39, 57, 37, 44, 34, 61, 39, 47, 35, 53, 40, 43, 32, 56, 37, 48, 34, 60, 40, 43, 35, 52, 39, 65, 33, 43, 39, 55, 35, 48, 36, 58, 40, 46, 34, 54, 39, 45],
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

const iconForMetric = (label: string) => label === 'Heart rate' ? HeartPulse : label === 'Temperature' ? Thermometer : label === 'Respiration' ? Wind : Droplets

function App() {
  const [summary, setSummary] = useState<HealthSummary>(fallbackSummary)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isStreaming, setIsStreaming] = useState(true)
  const [activeSection, setActiveSection] = useState('overview')
  const [notice, setNotice] = useState<string | null>(null)
  const [showModelDetails, setShowModelDetails] = useState(false)
  const [showActivity, setShowActivity] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [datasetName, setDatasetName] = useState('No custom dataset loaded')
  const [datasetRows, setDatasetRows] = useState(0)
  const [datasetError, setDatasetError] = useState<string | null>(null)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const storedTheme = window.localStorage.getItem('healthifyx-theme')
    return storedTheme === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('healthifyx-theme', theme)
  }, [theme])

  useEffect(() => {
    let isMounted = true
    const loadSummary = () => fetch('/api/health-summary')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('API unavailable')))
      .then((data: HealthSummary) => { if (isMounted) setSummary(data) })
      .catch(() => undefined)
    loadSummary()
    const interval = isStreaming ? window.setInterval(loadSummary, 5000) : undefined
    return () => { isMounted = false; if (interval) window.clearInterval(interval) }
  }, [isStreaming])

  useEffect(() => {
    if (!notice) return undefined
    const timeout = window.setTimeout(() => setNotice(null), 3500)
    return () => window.clearTimeout(timeout)
  }, [notice])

  const loadDataset = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const content = String(reader.result || '')
        const rows = file.name.toLowerCase().endsWith('.json')
          ? JSON.parse(content)
          : content.split(/\r?\n/).filter(Boolean).slice(1)
        if (!Array.isArray(rows) || rows.length === 0) throw new Error('No rows found')
        setDatasetName(file.name)
        setDatasetRows(rows.length)
        setDatasetError(null)
        setNotice(`${file.name} loaded with ${rows.length} data rows.`)
      } catch {
        setDatasetError('Use a CSV with a header row or a JSON array of records.')
      }
    }
    reader.readAsText(file)
  }

  const waveformPoints = summary.waveform.map((value, index) => `${index * 2.05},${90 - value}`).join(' ')

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-row"><div className="brand-mark"><Activity size={18} /></div><span>healthify<span className="brand-dot">X</span></span><button className="icon-button mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main navigation">
          <a className={`nav-link ${activeSection === 'overview' ? 'active' : ''}`} href="#overview" onClick={() => setActiveSection('overview')}><Activity size={17} /> Overview</a>
          <a className={`nav-link ${activeSection === 'signals' ? 'active' : ''}`} href="#signals" onClick={() => setActiveSection('signals')}><Radio size={17} /> Live signals <span className="nav-pulse" /></a>
          <a className={`nav-link ${activeSection === 'models' ? 'active' : ''}`} href="#models" onClick={() => setActiveSection('models')}><BrainCircuit size={17} /> AI insights</a>
          <a className={`nav-link ${activeSection === 'alerts' ? 'active' : ''}`} href="#alerts" onClick={() => setActiveSection('alerts')}><Bell size={17} /> Alerts <span className="nav-count">3</span></a>
        </nav>
        <div className="workspace-label second-label">SYSTEM</div>
        <nav className="main-nav"><button className="nav-link" onClick={() => setNotice('ESP32 wearable is connected at 115200 baud.')}><Zap size={17} /> Device status</button><button className="nav-link" onClick={() => setNotice('Documentation is coming with the hardware integration guide.')}><CircleHelp size={17} /> Documentation</button></nav>
        <div className="sidebar-bottom"><div className="device-card"><div className="device-icon"><Cloud size={18} /></div><div><strong>ESP32 wearable</strong><span><i className="online-dot" /> Connected · 115200 baud</span></div><MoreHorizontal size={18} /></div><div className="user-row"><div className="avatar">SR</div><div><strong>Research workspace</strong><span>Prototype account</span></div><ChevronDown size={16} /></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><button className="icon-button menu-trigger" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={21} /></button><div className="breadcrumb"><span>Workspace</span><span>/</span><strong>{activeSection === 'overview' ? 'Overview' : activeSection === 'signals' ? 'Live signals' : activeSection === 'models' ? 'AI insights' : 'Alerts'}</strong></div><div className="topbar-actions"><button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>{theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}</button><button className="icon-button" onClick={() => setNotice('HealthifyX monitors the demo stream and model readiness here.')} aria-label="Help"><CircleHelp size={19} /></button><button className="icon-button notification-button" onClick={() => { setActiveSection('alerts'); setNotice('You have 3 recent monitoring events.') }} aria-label="Notifications"><Bell size={19} /><i /></button><div className="top-avatar">SR</div></div></header>
        <div className="content-wrap">
          <section className="page-heading" id="overview"><div><div className="eyebrow"><span className="live-dot" /> LIVE MONITORING</div><h1>Good morning, Sarah</h1><p>Your multimodal health signals are looking steady today.</p></div><button className="date-control" onClick={() => setNotice('Date range controls will be connected to historical readings next.')}><span>Today, Sep 16</span><ChevronDown size={16} /></button></section>
          <section className="status-banner"><div className="status-symbol"><ShieldCheck size={24} /></div><div className="status-copy"><strong>System status: {summary.status}</strong><span>{summary.statusMessage}</span></div><div className="status-time">Updated {summary.updatedAt}</div><button className="text-button" onClick={() => setIsStreaming(!isStreaming)}>{isStreaming ? 'Pause stream' : 'Resume stream'} <span>{isStreaming ? 'Ⅱ' : '▶'}</span></button></section>

          <div className="section-heading"><div><h2>Today at a glance</h2><p>Live readings from your connected wearable</p></div><button className="outline-button" onClick={() => setIsStreaming(!isStreaming)}><span className={isStreaming ? 'button-live' : ''} /> {isStreaming ? 'Streaming' : 'Paused'} <ChevronDown size={15} /></button></div>
          <section className="metrics-grid">{summary.metrics.map((metric) => { const MetricIcon = iconForMetric(metric.label); return <article className={`metric-card ${metric.tone}`} key={metric.label}><div className="metric-top"><span className="metric-label">{metric.label}</span><div className="metric-icon"><MetricIcon size={19} /></div></div><div className="metric-value">{metric.value}<small>{metric.unit}</small></div><div className="metric-footer"><span className="trend-up">↗ {metric.trend}</span><span>vs. yesterday</span></div></article> })}</section>

          <section className="dashboard-grid" id="signals"><article className="panel waveform-panel"><div className="panel-heading"><div><h2>Signal activity</h2><p>ECG waveform · last 30 seconds</p></div><button className="panel-menu" onClick={() => setNotice('Signal options: ECG is selected at 250 Hz.')} aria-label="Signal options"><MoreHorizontal size={18} /></button></div><div className="waveform-wrap"><div className="wave-labels"><span>100</span><span>50</span><span>0</span></div><svg viewBox="0 0 101 90" preserveAspectRatio="none" role="img" aria-label="Demo ECG waveform"><defs><linearGradient id="waveFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#e9695c" stopOpacity=".24" /><stop offset="1" stopColor="#e9695c" stopOpacity="0" /></linearGradient></defs><path className="wave-area" d={`M 0,90 L ${waveformPoints} L 101,90 Z`} /><polyline className="wave-line" points={waveformPoints} /></svg></div><div className="wave-footer"><span><i className="legend-dot coral-dot" /> ECG signal</span><span>Sampling at 250 Hz</span><span className="wave-live"><i /> Live</span></div></article><article className="panel insight-panel" id="models"><div className="panel-heading"><div><h2>AI interpretation</h2><p>Multimodal model output</p></div><div className="ai-badge"><BrainCircuit size={14} /> AI</div></div><div className="insight-state"><div className="state-ring"><span>94.8<small>%</small></span><em>confidence</em></div><div><span className="state-kicker">CURRENT STATE</span><h3>Stable & balanced</h3><p>No notable deviation across combined signals.</p></div></div><div className="feature-list">{summary.model.features.map((feature, index) => <div className="feature-row" key={feature}><span>{feature}</span><div className="feature-track"><i style={{ width: `${86 - index * 7}%` }} /></div><strong>{86 - index * 7}%</strong></div>)}</div><button className="link-button" onClick={() => setShowModelDetails(true)}>Explore model details <MoveRight size={16} /></button></article></section>

          <section className="bottom-grid" id="alerts"><article className="panel alerts-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Events from your monitoring system</p></div><button className="link-button" onClick={() => setShowActivity(true)}>View all <MoveRight size={15} /></button></div><div className="activity-list">{summary.alerts.map((alert) => <div className="activity-row" key={alert.title}><div className={`activity-icon ${alert.tone}`}>{alert.tone === 'mint' ? <Cloud size={16} /> : alert.tone === 'sky' ? <Radio size={16} /> : <Bell size={16} />}</div><div><strong>{alert.title}</strong><span>{alert.detail}</span></div><time>{alert.time}</time></div>)}</div></article><article className="panel readiness-panel"><div className="panel-heading"><div><h2>Model readiness</h2><p>Research evaluation snapshot</p></div><button className="panel-menu" onClick={() => setNotice('Evaluation settings are ready for the next model run.')} aria-label="Model options"><MoreHorizontal size={18} /></button></div><div className="readiness-score"><strong>82</strong><span>/ 100</span><div className="score-track"><i /></div></div><div className="readiness-items"><div><span>Multimodal Random Forest</span><strong>{summary.model.latency}</strong></div><div><span>Subject-independent split</span><b>Ready</b></div></div><button className="outline-button full-button" onClick={() => setShowEvaluation(true)}>Open evaluation <MoveRight size={15} /></button></article></section>
          <footer className="disclaimer"><ShieldCheck size={15} /><span>HealthifyX is a research prototype. Readings are estimates for informational use and are not a medical diagnosis.</span></footer>
        </div>
      </main>
      {notice && <div className="toast" role="status"><ShieldCheck size={16} /><span>{notice}</span><button onClick={() => setNotice(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
      {(showModelDetails || showActivity || showEvaluation) && <div className="modal-backdrop" role="presentation" onClick={() => { setShowModelDetails(false); setShowActivity(false); setShowEvaluation(false) }}><section className={`modal-panel ${showEvaluation ? 'evaluation-modal' : ''}`} role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><span className="eyebrow">HEALTHIFYX RESEARCH</span><h2>{showModelDetails ? 'Model details' : showActivity ? 'Activity history' : 'Evaluation readiness'}</h2></div><button className="icon-button" onClick={() => { setShowModelDetails(false); setShowActivity(false); setShowEvaluation(false) }} aria-label="Close dialog"><X size={19} /></button></div>{showModelDetails && <><p className="modal-copy">The multimodal Random Forest combines signal features from the connected demo stream.</p><div className="modal-stat-grid"><div><strong>{summary.model.confidence}</strong><span>confidence</span></div><div><strong>{summary.model.latency}</strong><span>inference latency</span></div></div><ul className="modal-list">{summary.model.features.map((feature) => <li key={feature}><ShieldCheck size={15} />{feature}</li>)}</ul></>}{showActivity && <div className="modal-activity-list">{summary.alerts.map((alert) => <div className="activity-row" key={alert.title}><div className={`activity-icon ${alert.tone}`}><Bell size={16} /></div><div><strong>{alert.title}</strong><span>{alert.detail}</span></div><time>{alert.time}</time></div>)}</div>}{showEvaluation && <><p className="modal-copy">Demo snapshot of the required research protocol. Replace these values with measured results from a subject-independent dataset before making claims.</p><div className="dataset-loader"><div><strong>Custom dataset</strong><span>{datasetName}{datasetRows ? ` · ${datasetRows} rows` : ''}</span></div><label className="outline-button">Choose CSV / JSON<input type="file" accept=".csv,.json,text/csv,application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) loadDataset(file) }} /></label></div>{datasetError && <p className="dataset-error">{datasetError}</p>}<div className="evaluation-check"><ShieldCheck size={18} /><div><strong>{summary.evaluation.validation.method}</strong><span>{summary.evaluation.validation.train} for training, {summary.evaluation.validation.test} held out. {summary.evaluation.validation.leakageGuard}.</span></div></div><div className="evaluation-section"><div className="evaluation-section-title"><h3>Model comparison</h3><span>Classification</span></div><div className="evaluation-table model-table"><div className="evaluation-row table-head"><span>Model</span><span>Acc.</span><span>F1</span><span>ROC-AUC</span><span>Latency</span></div>{summary.evaluation.models.map((model) => <div className="evaluation-row" key={model.name}><strong>{model.name}</strong><span>{model.accuracy}</span><span>{model.f1}</span><span>{model.auc}</span><span>{model.latency}</span></div>)}</div></div><div className="evaluation-section"><div className="evaluation-section-title"><h3>Signal contribution</h3><span>Individual vs fusion</span></div><div className="fusion-list">{summary.evaluation.fusion.map((item) => <div className="fusion-row" key={item.name}><strong>{item.name}</strong><div className="fusion-track"><i style={{ width: item.accuracy }} /></div><span>{item.accuracy}</span><small>AUC {item.auc}</small></div>)}</div></div><div className="evaluation-dual"><div className="evaluation-section"><div className="evaluation-section-title"><h3>Hb estimation</h3><span>Regression</span></div><div className="hb-grid"><div><strong>{summary.evaluation.hb.mae}</strong><span>MAE</span></div><div><strong>{summary.evaluation.hb.rmse}</strong><span>RMSE</span></div><div><strong>{summary.evaluation.hb.r2}</strong><span>R²</span></div><div><strong>{summary.evaluation.hb.blandAltman}</strong><span>Bland-Altman</span></div></div></div><div className="evaluation-section"><div className="evaluation-section-title"><h3>Confusion matrix</h3><span>Stable / stress / fatigue</span></div><div className="confusion-matrix">{summary.evaluation.confusion.flatMap((row, rowIndex) => row.map((value, columnIndex) => <span className={rowIndex === columnIndex ? 'matrix-hit' : ''} key={`${rowIndex}-${columnIndex}`}>{value}</span>))}</div><div className="matrix-labels"><span>S</span><span>T</span><span>F</span></div></div></div><button className="outline-button full-button" onClick={() => { setShowEvaluation(false); setNotice('Evaluation run queued for the research workspace.') }}>Queue evaluation run <MoveRight size={15} /></button></>}</section></div>}
    </div>
  )
}

export default App
