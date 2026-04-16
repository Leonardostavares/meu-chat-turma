"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Chat() {
  const [estaLogado, setEstaLogado] = useState(false);
  const [dados, setDados] = useState({ nome: "", sala: "", nomeSala: "" });
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [texto, setTexto] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const entrarNaSala = async () => {
    if (!dados.nome || !dados.sala) {
      alert("Preencha seu nome e o código da sala.");
      return;
    }
    const { data, error } = await supabase
      .from("salas")
      .select("id, nome_exibicao")
      .eq("id", dados.sala)
      .single();

    if (!error && data) {
      setDados(prev => ({ ...prev, nomeSala: data.nome_exibicao }));
      setEstaLogado(true);  
    } else {
      alert("Código de sala inválido!");
    }
  };

  useEffect(() => {
    if (!estaLogado) return;
    const buscarMensagens = async () => {
      const { data } = await supabase
        .from("mensagens")
        .select("*")
        .eq("sala_id", dados.sala)
        .order("criado_em", { ascending: true });
      if (data) setMensagens(data);
    };
    buscarMensagens();

    const canal = supabase
      .channel(`sala-${dados.sala}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensagens' }, 
        (payload) => {
          if (payload.new.sala_id === dados.sala) {
            setMensagens((lista) => [...lista, payload.new]);
          }
        }
      ).subscribe();
    return () => { supabase.removeChannel(canal); };
  }, [estaLogado, dados.sala]);

  const enviarMensagem = async () => {
    if (!texto.trim()) return;
    await supabase.from("mensagens").insert([{ usuario: dados.nome, conteudo: texto, sala_id: dados.sala }]);
    setTexto("");
  };

  // TELA DE LOGIN
  if (!estaLogado) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-6 font-sans">
        <div className="flex flex-col gap-6 bg-white shadow-2xl p-10 rounded-[2.5rem] w-full max-w-sm border border-slate-100">
          <div className="text-center">
            <h1 className="text-4xl font-black text-blue-600 tracking-tighter uppercase italic">WebChat</h1>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2">Realtime Dashboard</p>
          </div>
          <div className="space-y-3">
            <input className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700" placeholder="Seu apelido" onChange={e => setDados({...dados, nome: e.target.value})} />
            <input type="text" inputMode="numeric" className="w-full bg-slate-50 p-4 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700" placeholder="ID da Sala" value={dados.sala} onChange={e => setDados({...dados, sala: e.target.value.replace(/\D/g, "")})} />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-blue-100 uppercase text-sm tracking-widest" onClick={entrarNaSala}>Conectar Agora</button>
          <Link href="/criar-sala" className="text-center text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">Gerenciar Salas</Link>
        </div>
      </div>
    );
  }

  // TELA DO DASHBOARD
  return (
    <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden">
      
      <aside className="hidden lg:flex w-[320px] flex-col p-8 bg-slate-50 border-r border-slate-200 shadow-inner">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-blue-600 uppercase tracking-tighter italic">WebChat</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">v1.0 stable release</p>
        </div>
        
        <div className="flex-1 space-y-8">
          <section>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tecnologias</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-600 uppercase">Next.js 14</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-bold text-slate-600 uppercase">Supabase Realtime</span>
              </div>
              <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <div className="w-2 h-2 bg-sky-400 rounded-full"></div>
                <span className="text-xs font-bold text-slate-600 uppercase">Tailwind CSS</span>
              </div>
            </div>
          </section>
        </div>

        <button onClick={() => window.location.reload()} className="mt-auto w-full p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 transition-all shadow-xl">
          Encerrar Sessão
        </button>
      </aside>

      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        <header className="px-10 py-6 border-b border-slate-100 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sala Ativa</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter leading-none">
              {dados.sala} • {dados.nomeSala}
            </h2>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Usuário logado</p>
            <p className="text-sm font-black text-blue-600 uppercase tracking-tighter">{dados.nome}</p>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-10 py-8 space-y-6 bg-slate-50/40">
          {mensagens.map((m, i) => {
            const eu = m.usuario === dados.nome;
            return (
              <div key={i} className={`flex ${eu ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] sm:max-w-[65%] flex flex-col ${eu ? 'items-end' : 'items-start'}`}>
                  {!eu && <span className="text-[9px] font-black text-slate-400 ml-4 mb-1 uppercase tracking-widest">{m.usuario}</span>}
                  
                  {/* BALÃO COM FIX PARA TEXTO LONGO */}
                  <div className={`px-6 py-4 rounded-[2rem] text-sm font-medium shadow-sm border break-words overflow-hidden w-full ${
                    eu 
                      ? 'bg-blue-600 text-white border-blue-500 rounded-tr-none' 
                      : 'bg-white text-slate-700 border-slate-200 rounded-tl-none'
                  }`}>
                    {m.conteudo}
                  </div>
                  
                  <span className="text-[8px] font-bold text-slate-300 mt-2 mx-4 uppercase tracking-widest">
                    {m.criado_em ? new Date(m.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <footer className="p-8 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto flex gap-4">
            <input 
              className="flex-1 bg-slate-100 p-5 rounded-3xl outline-none border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all text-sm font-medium shadow-inner" 
              value={texto} 
              onChange={e => setTexto(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && enviarMensagem()}
              placeholder="Digite sua mensagem aqui..."
            />
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-10 rounded-3xl font-black transition-all active:scale-95 shadow-xl shadow-blue-100 uppercase text-[10px] tracking-[0.2em]" onClick={enviarMensagem}>
              Enviar
            </button>
          </div>
        </footer>
      </main>
    </div>
  );
}