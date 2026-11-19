import LeafScreening from './LeafScreening'
import { useEffect, useState } from 'react'
import { api, saveSession, clearSession } from './api'
import {
  Sprout, LayoutDashboard, FlaskConical, Database, ClipboardList, LogOut,
  Menu, X, ShieldCheck, Leaf, ArrowUpRight, Plus, Search, AlertTriangle,
  CheckCircle2, Clock3, ChevronRight, ImagePlus
} from 'lucide-react'

const readUser = () => {
  try { return JSON.parse(localStorage.getItem('agrisafe_user')) } catch { return null }
}

export default function App() {
  const [user, setUser] = useState(readUser)
  const [page, setPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [samples, setSamples] = useState([])
  const [mrls, setMrls] = useState([])
  const [assessments, setAssessments] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function loadData() {
    if (!user) return
    setLoading(true); setError('')
    try {
      const [s, m, a] = await Promise.all([
        api('/api/samples'), api('/api/mrls'), api('/api/assessments')
      ])
      setSamples(s); setMrls(m); setAssessments(a)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { loadData() }, [user])

  function handleAuth(data) {
    saveSession(data); setUser(data.user); setPage('dashboard'); setError('')
  }
  function logout() {
    clearSession(); setUser(null); setSamples([]); setMrls([]); setAssessments([])
  }

  if (!user) return <AuthScreen onAuth={handleAuth} />

  const nav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'samples', label: 'Produce samples', icon: Leaf },
    { id: 'leaf-screening', label: 'Leaf Image Screening', icon: ImagePlus },
    { id: 'assessment', label: 'Residue assessment', icon: FlaskConical },
    { id: 'mrls', label: 'Pesticide & MRL data', icon: Database },
    { id: 'history', label: 'Assessment history', icon: ClipboardList }
  ]

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Sprout size={22}/></div><div><strong>AgriSafe</strong><small>FOOD SAFETY PLATFORM</small></div><button className="icon-btn mobile-close" onClick={() => setMobileOpen(false)}><X/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setMobileOpen(false); setNotice('') }}><item.icon size={18}/><span>{item.label}</span>{page === item.id && <ChevronRight size={15} className="nav-chevron"/>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="safety-note"><ShieldCheck size={18}/><div><b>Evidence-led assessment</b><small>Laboratory results compared with recorded limits.</small></div></div><div className="profile"><div className="avatar">{user.full_name?.[0]?.toUpperCase() || 'U'}</div><div className="profile-info"><b>{user.full_name}</b><small>{user.role === 'admin' ? 'Administrator' : 'User'}</small></div><button className="icon-btn" title="Sign out" onClick={logout}><LogOut size={17}/></button></div></div>
    </aside>
    {mobileOpen && <div className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
    <main className="main-area">
      <header className="topbar"><button className="icon-btn mobile-menu" onClick={() => setMobileOpen(true)}><Menu/></button><div className="breadcrumb">Workspace <span>/</span> <b>{nav.find(n => n.id === page)?.label}</b></div><div className="topbar-right"><span className="status-dot"/> System operational <div className="top-avatar">{user.full_name?.[0]?.toUpperCase()}</div></div></header>
      <div className="page-wrap">
        {error && <div className="alert error"><AlertTriangle size={17}/>{error}<button onClick={() => setError('')}>Dismiss</button></div>}
        {notice && <div className="alert success"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice('')}>Dismiss</button></div>}
        {page === 'dashboard' && <Dashboard user={user} samples={samples} mrls={mrls} assessments={assessments} loading={loading} onNavigate={setPage}/>}
        {page === 'samples' && <Samples samples={samples} refresh={loadData} notify={setNotice}/>}
        {page === 'leaf-screening' && <LeafScreening />}
        {page === 'assessment' && <Assessment samples={samples} refresh={loadData} notify={setNotice}/>}
        {page === 'mrls' && <MRLs mrls={mrls} user={user} refresh={loadData} notify={setNotice}/>}
        {page === 'history' && <History assessments={assessments} samples={samples}/>}
        <footer className="footer">AgriSafe <span>•</span> Decision-support tool, not a substitute for laboratory testing or official regulatory advice.</footer>
      </div>
    </main>
  </div>
}

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const update = e => setForm({ ...form, [e.target.name]: e.target.value })
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try {
      const data = await api(`/api/auth/${mode === 'login' ? 'login' : 'register'}`, {
        method: 'POST', body: JSON.stringify(form)
      })
      onAuth(data)
    } catch (e) { setError(e.message) } finally { setBusy(false) }
  }
  return <div className="auth-page"><div className="auth-panel"><div className="auth-brand"><div className="brand-mark"><Sprout size={24}/></div><div><b>AgriSafe</b><small>FOOD SAFETY PLATFORM</small></div></div><div className="auth-copy"><span className="eyebrow">SMARTER FOOD SAFETY</span><h1>Make food safety<br/><em>easier to understand.</em></h1><p>Bring produce samples, laboratory measurements and reference limits together in one clear workspace.</p></div><div className="auth-art"><div className="art-circle circle-one"/><div className="art-circle circle-two"/><div className="art-leaf"><Sprout size={112} strokeWidth={1}/></div><div className="art-caption"><ShieldCheck size={17}/> Evidence-led. Transparent. Practical.</div></div><small className="auth-legal">AgriSafe supports interpretation of laboratory results. Photos cannot establish pesticide residue levels.</small></div><div className="auth-form-side"><form className="auth-card" onSubmit={submit}><span className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span><h2>{mode === 'login' ? 'Sign in to AgriSafe' : 'Create your account'}</h2><p className="muted">{mode === 'login' ? 'Enter your details to access your workspace.' : 'Create a user account to start managing samples.'}</p>{mode === 'register' && <Field label="Full name"><input name="full_name" value={form.full_name} onChange={update} placeholder="Your full name" required minLength="2"/></Field>}<Field label="Email address"><input name="email" type="email" value={form.email} onChange={update} placeholder="you@example.com" required/></Field><Field label="Password"><input name="password" type="password" value={form.password} onChange={update} placeholder="At least 8 characters" required minLength="8"/></Field>{error && <div className="form-error">{error}</div>}<button className="btn primary full" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowUpRight size={17}/></button><div className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already registered?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></div><div className="auth-hint"><ShieldCheck size={15}/> Admin accounts are provisioned securely by the project administrator.</div></form></div></div>
}

function Field({ label, children }) { return <label className="field"><span>{label}</span>{children}</label> }

function PageHeading({ eyebrow, title, description, action }) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>
}
function StatCard({ label, value, note, icon: Icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-note">{note}</div></div>
}
function Dashboard({ user, samples, mrls, assessments, loading, onNavigate }) {
  const within = assessments.filter(a => a.status === 'WITHIN_MRL').length
  const above = assessments.filter(a => a.status === 'ABOVE_MRL').length
  const pending = assessments.filter(a => a.status === 'NO_MRL_FOUND').length
  return <><PageHeading eyebrow="YOUR WORKSPACE" title={`Good ${new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, ${user.full_name.split(' ')[0]}.`} description="Here's a snapshot of your food-safety assessment activity." action={<button className="btn primary" onClick={() => onNavigate('assessment')}><Plus size={17}/> New assessment</button>}/><div className="stat-grid"><StatCard label="Produce samples" value={samples.length} note="Samples in your workspace" icon={Leaf} tone="green"/><StatCard label="Within recorded MRL" value={within} note="Measured value ≤ recorded limit" icon={CheckCircle2} tone="green"/><StatCard label="Above recorded MRL" value={above} note="Requires attention" icon={AlertTriangle} tone="orange"/><StatCard label="MRL records" value={mrls.length} note="Reference records available" icon={Database} tone="purple"/></div><div className="dashboard-grid"><section className="panel"><div className="panel-head"><div><h3>Recent assessments</h3><p>Your latest laboratory result comparisons</p></div><button className="text-btn" onClick={() => onNavigate('history')}>View history <ArrowUpRight size={15}/></button></div>{loading ? <Empty text="Loading your records…"/> : assessments.length ? <div className="table-wrap"><table><thead><tr><th>PESTICIDE</th><th>MEASURED</th><th>MRL</th><th>RESULT</th></tr></thead><tbody>{assessments.slice(0,5).map(a => <tr key={a.id}><td><b>{a.pesticide_name}</b><small>Sample #{a.sample_id}</small></td><td>{a.measured_value} {a.unit}</td><td>{a.mrl_value == null ? '—' : `${a.mrl_value} ${a.unit}`}</td><td><Status status={a.status}/></td></tr>)}</tbody></table></div> : <Empty text="No assessments yet. Add a sample and enter a laboratory measurement to begin."/>}</section><section className="panel quick-panel"><div className="panel-head"><div><h3>Quick actions</h3><p>Common tasks</p></div></div><QuickAction icon={Leaf} title="Register a produce sample" desc="Create a sample record" onClick={() => onNavigate('samples')}/><QuickAction icon={FlaskConical} title="Assess residue levels" desc="Compare a lab result with an MRL" onClick={() => onNavigate('assessment')}/><QuickAction icon={Database} title="Browse MRL records" desc="Review pesticide reference data" onClick={() => onNavigate('mrls')}/><div className="notice-box"><ShieldCheck size={17}/><p><b>Remember</b><br/>An MRL comparison is only as reliable as the matching reference record, commodity definition, unit and source date.</p></div></section></div><div className="info-strip"><div className="info-icon"><Clock3 size={18}/></div><div><b>{pending} assessments need a reference check</b><p>These entries did not find a matching pesticide, commodity and unit in the current MRL database.</p></div></div></>
}
function QuickAction({ icon: Icon, title, desc, onClick }) { return <button className="quick-action" onClick={onClick}><span><Icon size={18}/></span><div><b>{title}</b><small>{desc}</small></div><ChevronRight size={17}/></button> }
function Status({ status }) {
  const map = { WITHIN_MRL: ['Within MRL','good'], ABOVE_MRL: ['Above MRL','bad'], NO_MRL_FOUND: ['No MRL found','pending'] }
  const [label, cls] = map[status] || [status, 'pending']
  return <span className={`status-pill ${cls}`}><i/>{label}</span>
}
function Empty({ text }) { return <div className="empty-state"><div className="empty-icon"><ClipboardList size={22}/></div><p>{text}</p></div> }

function Samples({ samples, refresh, notify }) {
  const [show, setShow] = useState(false)
  const [form, setForm] = useState({ sample_code: '', commodity: '', variety: '', origin: '', notes: '' })
  const [busy, setBusy] = useState(false), [error, setError] = useState('')
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('')
    try { await api('/api/samples', { method: 'POST', body: JSON.stringify(form) }); setForm({ sample_code:'', commodity:'', variety:'', origin:'', notes:'' }); setShow(false); notify('Sample registered successfully.'); await refresh() }
    catch(e) { setError(e.message) } finally { setBusy(false) }
  }
  return <><PageHeading eyebrow="SAMPLE MANAGEMENT" title="Produce samples" description="Register and keep track of the produce samples submitted for assessment." action={<button className="btn primary" onClick={() => setShow(!show)}><Plus size={17}/> Add sample</button>}/>{show && <form className="panel form-panel" onSubmit={submit}><div className="panel-head"><div><h3>New sample</h3><p>Enter the basic details for this produce sample.</p></div></div><div className="form-grid"><Field label="Sample code *"><input required value={form.sample_code} onChange={e=>setForm({...form,sample_code:e.target.value})} placeholder="e.g. AGR-2026-001"/></Field><Field label="Commodity *"><input required value={form.commodity} onChange={e=>setForm({...form,commodity:e.target.value})} placeholder="e.g. Tomato"/></Field><Field label="Variety"><input value={form.variety} onChange={e=>setForm({...form,variety:e.target.value})} placeholder="Optional"/></Field><Field label="Origin"><input value={form.origin} onChange={e=>setForm({...form,origin:e.target.value})} placeholder="Farm / district"/></Field><Field label="Notes"><input value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Optional notes"/></Field></div>{error && <div className="form-error">{error}</div>}<div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setShow(false)}>Cancel</button><button className="btn primary" disabled={busy}>{busy?'Saving…':'Save sample'}</button></div></form>}<section className="panel"><div className="panel-head"><div><h3>All samples</h3><p>{samples.length} registered sample(s)</p></div><span className="search-label"><Search size={15}/> Sample register</span></div>{samples.length ? <div className="table-wrap"><table><thead><tr><th>SAMPLE CODE</th><th>COMMODITY</th><th>VARIETY</th><th>ORIGIN</th><th>CREATED</th></tr></thead><tbody>{samples.map(s=><tr key={s.id}><td><b>{s.sample_code}</b></td><td>{s.commodity}</td><td>{s.variety || '—'}</td><td>{s.origin || '—'}</td><td>{new Date(s.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>:<Empty text="No samples have been registered yet. Use Add sample to create your first record."/>}</section></>
}

function Assessment({ samples, refresh, notify }) {
  const [form,setForm]=useState({sample_id:'',pesticide_name:'',measured_value:'',unit:'mg/kg'})
  const [result,setResult]=useState(null), [error,setError]=useState(''), [busy,setBusy]=useState(false)
  async function submit(e) {
    e.preventDefault(); setBusy(true); setError(''); setResult(null)
    try { const data=await api('/api/assessments',{method:'POST',body:JSON.stringify({...form,sample_id:Number(form.sample_id),measured_value:Number(form.measured_value)})}); setResult(data); notify('Residue assessment saved.'); await refresh() }
    catch(e){setError(e.message)} finally{setBusy(false)}
  }
  return <><PageHeading eyebrow="LABORATORY RESULT REVIEW" title="Residue assessment" description="Compare a laboratory-measured residue value with a matching MRL reference record."/><div className="assessment-layout"><form className="panel form-panel" onSubmit={submit}><div className="panel-head"><div><h3>Enter laboratory result</h3><p>Use the result and unit provided by the testing laboratory.</p></div><span className="step-tag">01 / INPUT</span></div><Field label="Produce sample *"><select required value={form.sample_id} onChange={e=>setForm({...form,sample_id:e.target.value})}><option value="">Select a registered sample</option>{samples.map(s=><option key={s.id} value={s.id}>{s.sample_code} — {s.commodity}</option>)}</select></Field><Field label="Pesticide name *"><input required value={form.pesticide_name} onChange={e=>setForm({...form,pesticide_name:e.target.value})} placeholder="e.g. Chlorpyrifos"/></Field><div className="form-grid two"><Field label="Measured residue *"><input type="number" min="0" step="any" required value={form.measured_value} onChange={e=>setForm({...form,measured_value:e.target.value})} placeholder="0.00"/></Field><Field label="Unit"><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option>mg/kg</option><option>µg/kg</option></select></Field></div>{error && <div className="form-error">{error}</div>}<button className="btn primary full" disabled={busy || !samples.length}>{busy?'Assessing…':'Run MRL comparison'} <ArrowUpRight size={17}/></button>{!samples.length && <p className="field-help">Register a produce sample before creating an assessment.</p>}</form><div className="panel result-panel"><div className="result-top"><span className="eyebrow">ASSESSMENT OUTPUT</span><div className="result-emblem"><FlaskConical size={25}/></div></div>{result ? <><h2 className={result.status==='ABOVE_MRL'?'text-danger':result.status==='WITHIN_MRL'?'text-green':''}>{result.status==='WITHIN_MRL'?'Within MRL':result.status==='ABOVE_MRL'?'Above MRL':'No matching MRL'}</h2><p className="muted">{result.status==='WITHIN_MRL'?'The entered measurement is at or below the matching recorded MRL.':result.status==='ABOVE_MRL'?'The entered measurement exceeds the matching recorded MRL.':'No matching pesticide, commodity and unit record was found. No compliance conclusion can be made.'}</p><div className="result-values"><div><small>MEASURED VALUE</small><b>{result.measured_value} {result.unit}</b></div><div><small>RECORDED MRL</small><b>{result.mrl_value == null?'Not found':`${result.mrl_value} ${result.unit}`}</b></div></div><div className="notice-box"><ShieldCheck size={17}/><p>Assessment saved as record #{result.id}. Confirm that the MRL reference is current and applicable before relying on this result.</p></div></>:<><h2>Ready to assess</h2><p className="muted">Your comparison result will appear here after you submit a laboratory measurement.</p><div className="result-placeholder"><div><FlaskConical size={30}/></div><span>Waiting for laboratory data</span></div><div className="notice-box"><AlertTriangle size={17}/><p>Photographs cannot determine pesticide residue concentration. Enter a laboratory result for this comparison.</p></div></>}</div></div></>
}

function MRLs({mrls,user,refresh,notify}) {
  const [show,setShow]=useState(false),[error,setError]=useState('')
  const [form,setForm]=useState({pesticide_name:'',commodity:'',mrl_value:'',unit:'mg/kg',source_name:'FSSAI',source_reference:'',effective_date:'',source_checked_on:'',notes:''})
  async function submit(e){e.preventDefault();setError('');try{await api('/api/mrls',{method:'POST',body:JSON.stringify({...form,mrl_value:Number(form.mrl_value)})});setShow(false);notify('MRL reference record added. Verify its regulatory applicability and source.');await refresh()}catch(e){setError(e.message)}}
  return <><PageHeading eyebrow="REFERENCE LIBRARY" title="Pesticide & MRL data" description="Browse the maximum residue limit records used by the assessment engine." action={user.role==='admin'&&<button className="btn primary" onClick={()=>setShow(!show)}><Plus size={17}/> Add MRL record</button>}/><div className="info-strip"><div className="info-icon"><ShieldCheck size={18}/></div><div><b>Reference data requires verification</b><p>Only add values checked against the applicable official FSSAI schedule. This starter does not ship with assumed or fabricated MRL values.</p></div></div>{show && user.role==='admin' && <form className="panel form-panel" onSubmit={submit}><div className="panel-head"><div><h3>Add reference record</h3><p>Record the source and effective date along with the value.</p></div></div><div className="form-grid"><Field label="Pesticide name *"><input required value={form.pesticide_name} onChange={e=>setForm({...form,pesticide_name:e.target.value})}/></Field><Field label="Commodity *"><input required value={form.commodity} onChange={e=>setForm({...form,commodity:e.target.value})}/></Field><Field label="MRL value *"><input type="number" min="0" step="any" required value={form.mrl_value} onChange={e=>setForm({...form,mrl_value:e.target.value})}/></Field><Field label="Unit"><select value={form.unit} onChange={e=>setForm({...form,unit:e.target.value})}><option>mg/kg</option><option>µg/kg</option></select></Field><Field label="Source name *"><input required value={form.source_name} onChange={e=>setForm({...form,source_name:e.target.value})}/></Field><Field label="Source reference / URL"><input value={form.source_reference} onChange={e=>setForm({...form,source_reference:e.target.value})}/></Field><Field label="Effective date"><input type="date" value={form.effective_date} onChange={e=>setForm({...form,effective_date:e.target.value})}/></Field><Field label="Checked on"><input type="date" value={form.source_checked_on} onChange={e=>setForm({...form,source_checked_on:e.target.value})}/></Field></div>{error&&<div className="form-error">{error}</div>}<div className="form-actions"><button type="button" className="btn secondary" onClick={()=>setShow(false)}>Cancel</button><button className="btn primary">Save reference</button></div></form>}<section className="panel"><div className="panel-head"><div><h3>MRL reference records</h3><p>{mrls.length} record(s) available</p></div></div>{mrls.length?<div className="table-wrap"><table><thead><tr><th>PESTICIDE</th><th>COMMODITY</th><th>MRL</th><th>SOURCE</th><th>CHECKED ON</th></tr></thead><tbody>{mrls.map(m=><tr key={m.id}><td><b>{m.pesticide_name}</b></td><td>{m.commodity}</td><td>{m.mrl_value} {m.unit}</td><td>{m.source_name}{m.source_reference&&<small>{m.source_reference}</small>}</td><td>{m.source_checked_on||'—'}</td></tr>)}</tbody></table></div>:<Empty text="No MRL reference records yet. An administrator can add verified records using Add MRL record."/>}</section></>
}
function History({assessments,samples}) {
  const sampleMap=Object.fromEntries(samples.map(s=>[s.id,s]))
  return <><PageHeading eyebrow="RECORDS" title="Assessment history" description="Review saved comparisons and their recorded outcomes."/><section className="panel"><div className="panel-head"><div><h3>All assessments</h3><p>{assessments.length} assessment(s)</p></div></div>{assessments.length?<div className="table-wrap"><table><thead><tr><th>DATE</th><th>SAMPLE</th><th>PESTICIDE</th><th>MEASURED</th><th>MRL</th><th>STATUS</th></tr></thead><tbody>{assessments.map(a=><tr key={a.id}><td>{new Date(a.created_at).toLocaleDateString()}</td><td><b>{sampleMap[a.sample_id]?.sample_code || `#${a.sample_id}`}</b><small>{sampleMap[a.sample_id]?.commodity || ''}</small></td><td>{a.pesticide_name}</td><td>{a.measured_value} {a.unit}</td><td>{a.mrl_value==null?'—':`${a.mrl_value} ${a.unit}`}</td><td><Status status={a.status}/></td></tr>)}</tbody></table></div>:<Empty text="Your saved assessments will appear here."/>}</section></>
}
