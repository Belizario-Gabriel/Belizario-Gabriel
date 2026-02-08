import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function NewGamePage() {
  const [name, setName] = useState('Meu Conglomerado');
  const [scenario, setScenario] = useState('Global Streaming Boom');
  const [difficulty, setDifficulty] = useState<'sandbox'|'normal'|'hardcore'>('normal');
  const [seed, setSeed] = useState(1234);
  const navigate = useNavigate();

  return <div className="min-h-screen p-10"><div className="card max-w-xl mx-auto space-y-3">
    <h2 className="font-semibold text-lg">Novo jogo</h2>
    <input className="input" value={name} onChange={e=>setName(e.target.value)} />
    <input className="input" value={scenario} onChange={e=>setScenario(e.target.value)} />
    <select className="input" value={difficulty} onChange={e=>setDifficulty(e.target.value as any)}><option value="sandbox">Sandbox</option><option value="normal">Normal</option><option value="hardcore">Hardcore</option></select>
    <input className="input" type="number" value={seed} onChange={e=>setSeed(Number(e.target.value))} />
    <button className="btn" onClick={async()=>{const {data}=await api.post('/saves',{name,scenario,difficulty,seed});localStorage.setItem('saveId',data.id);navigate('/app/dashboard');}}>Criar Save</button>
  </div></div>;
}
