import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export function AuthPage() {
  const [email, setEmail] = useState('ceo@studio.test');
  const [password, setPassword] = useState('123456');
  const [isRegister, setRegister] = useState(false);
  const navigate = useNavigate();

  async function submit(e: FormEvent) {
    e.preventDefault();
    const path = isRegister ? '/auth/register' : '/auth/login';
    const { data } = await api.post(path, { email, password });
    localStorage.setItem('token', data.token);
    navigate('/new-game');
  }

  return <div className="min-h-screen grid place-items-center"><form onSubmit={submit} className="card w-full max-w-md space-y-3">
    <h1 className="text-xl font-bold">Entertainment Tycoon</h1>
    <input className="input" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
    <input className="input" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Senha" />
    <button className="btn w-full">{isRegister ? 'Registrar' : 'Entrar'}</button>
    <button type="button" className="text-xs text-slate-400" onClick={()=>setRegister(!isRegister)}>{isRegister ? 'Já tenho conta' : 'Criar conta'}</button>
  </form></div>;
}
