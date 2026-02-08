import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const sections = ['dashboard','financas','producoes','marketing','funcionarios','streaming','tv-distribuicao','hqs-ip','localizacoes','concorrentes','relatorios','tecnologia','leiloes-ip','crises-eventos','configuracoes','save-load'];

function Placeholder({ title }: { title: string }) {
  return <div className="card"><h2 className="font-semibold mb-2">{title}</h2><p className="text-sm text-slate-400">Módulo funcional do MVP.</p></div>;
}

function Dashboard() {
  const [data, setData] = useState<any>(null);
  const saveId = localStorage.getItem('saveId');
  useEffect(()=>{if(saveId) api.get(`/dashboards/${saveId}`).then(r=>setData(r.data));},[saveId]);
  if(!data) return <div className="card">Carregando...</div>;
  const latest = data.latest;
  return <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">{[
      ['Caixa', latest?.cash?.toFixed(0)],['Lucro', latest?.profit?.toFixed(0)],['Reputação',latest?.reputation?.toFixed(1)],['Assinantes',latest?.subscribers],['Share',`${(latest?.marketShare*100).toFixed(1)}%`],['NPS',latest?.nps?.toFixed(1)]
    ].map(([k,v])=><div key={String(k)} className="card"><div className="text-xs text-slate-400">{k}</div><div className="font-bold">{v}</div></div>)}</div>
    <div className="card h-72"><ResponsiveContainer><LineChart data={data.series}><XAxis dataKey="month"/><YAxis/><Tooltip/><Line dataKey="cash" stroke="#6366f1"/><Line dataKey="subscribers" stroke="#10b981"/></LineChart></ResponsiveContainer></div>
    <button className="btn" onClick={async()=>{await api.post('/turn/advance',{saveId}); const r=await api.get(`/dashboards/${saveId}`); setData(r.data);}}>Avançar mês</button>
  </div>;
}

function Financas() { const [tx,setTx]=useState<any[]>([]); const saveId=localStorage.getItem('saveId'); useEffect(()=>{if(saveId) api.get(`/saves/${saveId}`).then(()=>api.get(`/reports/${saveId}/csv`)); api.get(`/dashboards/${saveId}`).then(()=>{});},[saveId]); return <Placeholder title="Finanças (DRE / Ledger / Projeções)"/>; }
function Producoes(){return <CrudPage title="Produções" endpoint="/productions" fields={[['productionId',''],['budget',1000000],['durationMonths',6],['risk',0.4],['targetRegions','global']]} />}
function Marketing(){return <CrudPage title="Marketing" endpoint="/campaigns" fields={[['channel','social'],['budget',300000],['target','18-34'],['startedMonth',1]]} />}
function Funcionarios(){return <CrudPage title="Funcionários" endpoint="/employees" fields={[['name','Analista'],['department','Marketing'],['salary',8000],['skill',0.6],['productivity',0.65],['morale',0.7]]} />}
function Localizacoes(){return <Placeholder title="Localizações"/>}
function Tecnologia(){return <TechPage/>}
function Leiloes(){return <AuctionPage/>}
function Crises(){return <CrisisPage/>}
function Relatorios(){ const saveId=localStorage.getItem('saveId'); return <div className="card"><h2 className="font-semibold">Relatórios</h2><a className="text-indigo-400" href={`http://localhost:3001/api/reports/${saveId}/csv`}>Exportar CSV</a></div> }

function CrudPage({title, endpoint, fields}:{title:string;endpoint:string;fields:[string, any][]}){
  const saveId=localStorage.getItem('saveId')!; const [items,setItems]=useState<any[]>([]); const [form,setForm]=useState<any>(Object.fromEntries(fields));
  const load=()=>api.get(endpoint,{params:{saveId}}).then(r=>setItems(r.data));
  useEffect(load,[]);
  return <div className="space-y-3"><div className="card"><h2 className="font-semibold">{title}</h2><div className="grid md:grid-cols-3 gap-2 mt-2">{fields.map(([k])=><input key={k} className="input" value={form[k]} onChange={e=>setForm({...form,[k]:isNaN(Number(e.target.value))?e.target.value:Number(e.target.value)})} placeholder={k}/>)}<button className="btn" onClick={async()=>{await api.post(endpoint,{saveId,...form});load();}}>Adicionar</button></div></div>
  <div className="card overflow-auto"><table className="w-full text-sm"><thead><tr>{Object.keys(items[0]||{}).map(k=><th key={k} className="text-left p-1">{k}</th>)}</tr></thead><tbody>{items.map((it,i)=><tr key={i}>{Object.values(it).map((v,j)=><td key={j} className="p-1">{String(v)}</td>)}</tr>)}</tbody></table></div></div>;
}

function TechPage(){ const saveId=localStorage.getItem('saveId'); const [data,setData]=useState<any>(); const [month]=useState(1); useEffect(()=>{api.get('/tech',{params:{saveId}}).then(r=>setData(r.data));},[saveId]); if(!data) return <Placeholder title='Tecnologia'/>; return <div className='grid md:grid-cols-2 gap-3'>{data.techs.map((t:any)=><div key={t.id} className='card'><h3>{t.name}</h3><p className='text-xs text-slate-400'>{t.description}</p><button className='btn mt-2' onClick={async()=>{await api.post('/tech/queue',{saveId,techId:t.id,currentMonth:month}); const r=await api.get('/tech',{params:{saveId}}); setData(r.data);}}>Pesquisar</button></div>)}<div className='card'><h3>Fila</h3>{data.queue.map((q:any)=><div key={q.id}>{q.tech.name} até mês {q.completesMonth}</div>)}</div></div>; }
function AuctionPage(){ const saveId=localStorage.getItem('saveId'); const [list,setList]=useState<any[]>([]); useEffect(()=>{api.get('/auctions/current',{params:{month:1}}).then(r=>setList(r.data));},[]); return <div className='space-y-3'>{list.map(a=><div className='card' key={a.id}><h3>{a.ipAsset.name}</h3><p>Lance atual: {a.highestBid}</p><button className='btn' onClick={async()=>{await api.post(`/auctions/${a.id}/bid`,{saveId,value:a.highestBid+100000});}}>Dar lance</button></div>)}</div>; }
function CrisisPage(){ const saveId=localStorage.getItem('saveId'); const [items,setItems]=useState<any[]>([]); const load=()=>api.get('/crises',{params:{saveId}}).then(r=>setItems(r.data)); useEffect(load,[]); return <div className='space-y-2'>{items.map(c=><div key={c.id} className='card'><h3>{c.type} (sev {c.severity})</h3><button className='btn' onClick={async()=>{await api.post(`/crises/${c.id}/respond`,{option:'consulting'});load();}}>Responder</button></div>)}</div>; }

export function MainLayout() {
  const location = useLocation();
  return <div className="min-h-screen grid grid-cols-[240px_1fr]">
    <aside className="border-r border-slate-800 p-3 space-y-1">{sections.map((s)=><Link key={s} className={`block px-3 py-2 rounded ${location.pathname.includes(s)?'bg-indigo-600':'hover:bg-slate-800'}`} to={`/app/${s}`}>{s}</Link>)}</aside>
    <main className="p-4 space-y-4"><div className="card flex justify-between"><span>Data do jogo</span><span>Alertas e KPIs na topbar</span></div>
      <Routes>
        <Route path="dashboard" element={<Dashboard/>}/>
        <Route path="financas" element={<Financas/>}/>
        <Route path="producoes" element={<Producoes/>}/>
        <Route path="marketing" element={<Marketing/>}/>
        <Route path="funcionarios" element={<Funcionarios/>}/>
        <Route path="streaming" element={<Placeholder title="Streaming"/>}/>
        <Route path="tv-distribuicao" element={<Placeholder title="TV/Distribuição"/>}/>
        <Route path="hqs-ip" element={<Placeholder title="HQs/IP"/>}/>
        <Route path="localizacoes" element={<Localizacoes/>}/>
        <Route path="concorrentes" element={<Placeholder title="Concorrentes"/>}/>
        <Route path="relatorios" element={<Relatorios/>}/>
        <Route path="tecnologia" element={<Tecnologia/>}/>
        <Route path="leiloes-ip" element={<Leiloes/>}/>
        <Route path="crises-eventos" element={<Crises/>}/>
        <Route path="configuracoes" element={<Placeholder title="Configurações"/>}/>
        <Route path="save-load" element={<Placeholder title="Save/Load"/>}/>
      </Routes>
    </main>
  </div>;
}
