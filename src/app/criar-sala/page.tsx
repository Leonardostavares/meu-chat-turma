"use client";
import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link"; // Import necessário para o link de voltar

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function CriarSala() {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");

  const salvarSala = async () => {
    // 1. Validação básica antes de enviar ao banco
    if (!numero || !nome) {
      alert("Por favor, preencha o número e o nome da sala!");
      return;
    }

    // 2. Tenta inserir na tabela 'salas'
    const { error } = await supabase
      .from("salas")
      .insert([{ id: numero, nome_exibicao: nome }]);

    if (error) {
      alert("Erro ao criar sala: " + error.message);
    } else {
      alert("Sala criada com sucesso!");
      // Opcional: Limpar campos após sucesso
      setNumero("");
      setNome("");
    }
  };

  return (
    // Estrutura flex para centralizar igual a principal
    <div className="flex h-screen items-center justify-center bg-black text-white p-6">
      
      {/* Container do formulário com bordas e padding igual a principal */}
      <div className="flex flex-col gap-4 border border-zinc-800 p-8 rounded w-full max-w-sm bg-black">
        
        {/* Título com o mesmo estilo azul e maiúsculo da principal */}
        <h1 className="text-2xl font-bold text-center text-blue-500 uppercase tracking-tighter">
          Nova Sala
        </h1>
        
        {/* Input Número da Sala - Estilo idêntico ao de Código da Sala */}
        <input 
          type="text"
          inputMode="numeric" // Teclado numérico no celular
          className="bg-zinc-900 p-3 rounded border border-zinc-800 outline-none focus:border-blue-600 transition text-white placeholder-zinc-500" 
          placeholder="Número da Sala (Ex: 05)" 
          value={numero}
          onChange={e => setNumero(e.target.value.replace(/\D/g, ""))} // Apenas números
        />
  
        {/* Input Nome da Sala - Estilo idêntico ao de Nome de Usuário */}
        <input 
          className="bg-zinc-900 p-3 rounded border border-zinc-800 outline-none focus:border-blue-600 transition text-white placeholder-zinc-500" 
          placeholder="Nome da Sala (Ex: Turma de Tarde)" 
          value={nome}
          onChange={e => setNome(e.target.value)} 
        />

        {/* Botão SALVAR - Estilo azul idêntico ao botão ENTRAR */}
        <button 
          onClick={salvarSala} 
          className="bg-blue-600 p-3 rounded font-bold hover:bg-blue-700 transition mt-2 uppercase tracking-wide"
        >
          SALVAR NO BANCO
        </button>

        {/* Link de VOLTAR - Minimalista igual o 'SAIR' ou 'Cadastrar Nova Sala' */}
        <Link 
          href="/" 
          className="text-center text-[10px] text-zinc-500 hover:text-white mt-4 underline uppercase tracking-widest"
        >
          Voltar para o Login
        </Link>
      </div>
    </div>
  );
}