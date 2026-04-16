"use client";
import { useState, useEffect } from "react";
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

  const entrarNaSala = async () => {
    if (!dados.nome || !dados.sala) {
      alert("Por favor, preencha seu nome e o código da sala.");
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
      alert("Código de sala não encontrado!");
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
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'mensagens' }, 
        (payload) => {
          if (payload.new.sala_id === dados.sala) {
            setMensagens((lista) => [...lista, payload.new]);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(canal); };
  }, [estaLogado]);

  const enviarMensagem = async () => {
    if (!texto.trim()) return;
    await supabase.from("mensagens").insert([
      { usuario: dados.nome, conteudo: texto, sala_id: dados.sala }
    ]);
    setTexto("");
  };

  if (!estaLogado) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white p-6">
        <div className="flex flex-col gap-4 border border-zinc-800 p-8 rounded w-full max-w-sm">
          <h1 className="text-2xl font-bold text-center text-blue-500 uppercase tracking-tighter">Chat Privado</h1>
          <input 
            className="bg-zinc-900 p-3 rounded border border-zinc-800 outline-none focus:border-blue-600 transition" 
            placeholder="Seu Nome" 
            onChange={e => setDados({...dados, nome: e.target.value})} 
          />
          <input 
            type="text"
            inputMode="numeric"
            className="bg-zinc-900 p-3 rounded border border-zinc-800 outline-none focus:border-blue-600 transition" 
            placeholder="Código da Sala (Números)" 
            value={dados.sala}
            onChange={e => setDados({...dados, sala: e.target.value.replace(/\D/g, "")})} 
          />
          <button className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-700 transition mt-2" onClick={entrarNaSala}>
            ENTRAR NA SALA
          </button>
          <Link href="/criar-sala" className="text-center text-[10px] text-zinc-500 hover:text-white mt-4 underline uppercase tracking-widest">
            Cadastrar Nova Sala
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white p-4 max-w-2xl mx-auto">
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2 mb-4">
        <h2 className="text-blue-500 font-bold uppercase tracking-tighter flex flex-col leading-tight">
          <span className="text-[10px] text-zinc-500">SALA {dados.sala}</span>
          <span>{dados.nomeSala}</span>
        </h2>
        <button onClick={() => window.location.reload()} className="text-[10px] text-zinc-500 hover:text-white">SAIR</button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-hide">
        {mensagens.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.usuario === dados.nome ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-zinc-600 mb-1 font-mono uppercase tracking-widest">
              {m.usuario}
            </span>
            
            <div className={`flex flex-col ${m.usuario === dados.nome ? 'items-end' : 'items-start'}`}>
              <p className={`p-3 rounded-2xl text-sm ${
                m.usuario === dados.nome 
                  ? 'bg-blue-700 text-white rounded-tr-none' 
                  : 'bg-zinc-900 border border-zinc-800 rounded-tl-none'
              }`}>
                {m.conteudo}
              </p>
              
              {/* TIMESTAMP ADICIONADO AQUI */}
              <span className="text-[9px] text-zinc-600 mt-1 font-mono italic">
                {m.criado_em ? new Date(m.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-t border-zinc-800 pt-4 mt-2">
        <input 
          className="flex-1 bg-zinc-900 p-3 rounded-xl outline-none border border-zinc-800 focus:border-blue-600" 
          value={texto} 
          onChange={e => setTexto(e.target.value)} 
          onKeyDown={e => e.key === 'Enter' && enviarMensagem()}
          placeholder="Mensagem..."
        />
        <button className="bg-white text-black px-6 rounded-xl font-bold hover:bg-zinc-200" onClick={enviarMensagem}>
          ENVIAR
        </button>
      </div>
    </div>
  );
}