"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CriarSala() {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");

  const salvarSala = async () => {
    if (!numero || !nome) {
      alert("Por favor, preencha todos os campos!");
      return;
    }

    const { error } = await supabase
      .from("salas")
      .insert([{ id: numero, nome_exibicao: nome }]);

    if (error) {
      alert("Erro ao criar sala: " + error.message);
    } else {
      alert("Sala criada com sucesso!");
      setNumero("");
      setNome("");
    }
  };

  return (
    <div className="flex h-screen bg-white text-slate-800 font-sans overflow-hidden">
      
      {/* SIDEBAR ESQUERDA (MANTENDO O PADRÃO) */}
      <aside className="hidden lg:flex w-[320px] flex-col p-8 bg-slate-50 border-r border-slate-200 shadow-inner">
        <div className="mb-10">
          <h1 className="text-3xl font-black text-blue-600 uppercase tracking-tighter italic">WebChat</h1>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Painel Administrativo</p>
        </div>
        
        <div className="flex-1">
          <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Instruções</h3>
            <p className="text-xs text-slate-500 leading-relaxed text-center">
              As salas criadas aqui ficarão disponíveis imediatamente para acesso via <strong>Código ID</strong>.
            </p>
          </section>
        </div>

        <Link href="/" className="mt-auto w-full p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl text-center">
          Voltar ao Início
        </Link>
      </aside>

      {/* ÁREA DE CADASTRO (DIREITA) */}
      <main className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 p-6">
        
        <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-500">
          <div className="mb-8 text-center">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Configurações</span>
            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Nova Turma</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Identificador (ID)</label>
              <input 
                type="text"
                inputMode="numeric"
                className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium" 
                placeholder="Ex: 10" 
                value={numero}
                onChange={e => setNumero(e.target.value.replace(/\D/g, ""))}
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 mb-2 block tracking-widest">Nome da Sala</label>
              <input 
                className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-700 font-medium" 
                placeholder="Ex: Engenharia de Software" 
                value={nome}
                onChange={e => setNome(e.target.value)} 
              />
            </div>

            <button 
              onClick={salvarSala} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-2xl font-black transition-all active:scale-95 shadow-xl shadow-blue-100 uppercase tracking-[0.2em] text-xs mt-4"
            >
              Registrar no Banco
            </button>
          </div>
          
          <p className="text-center text-[9px] text-slate-300 mt-8 uppercase font-bold tracking-widest">
            Segurança garantida via Supabase DB
          </p>
        </div>

      </main>
    </div>
  );
}