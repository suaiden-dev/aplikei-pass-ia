import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// IMPORTANTE: Para limpar o Storage, você precisará da SERVICE_ROLE_KEY no seu .env
// Adicione: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const bucktsToClean = [
  'documents',
  'zelle_comprovantes',
  'visa-documents',
  'process-documents'
];

async function cleanStorage() {
  console.log('🚀 Iniciando limpeza do Storage...');

  for (const bucketName of bucktsToClean) {
    try {
      console.log(`\n📁 Limpando bucket: ${bucketName}...`);
      
      // 1. Listar todos os arquivos no bucket (recursivo)
      const { data: files, error: listError } = await supabase
        .storage
        .from(bucketName)
        .list('', { limit: 1000 });

      if (listError) {
        console.error(`❌ Erro ao listar arquivos no bucket ${bucketName}:`, listError.message);
        continue;
      }

      if (!files || files.length === 0) {
        console.log(`✅ Bucket ${bucketName} já está vazio.`);
        continue;
      }

      // 2. Filtrar nomes de arquivos para remoção
      const filesToRemove = files.map(f => f.name);
      
      // 3. Remover arquivos
      const { data: removed, error: removeError } = await supabase
        .storage
        .from(bucketName)
        .remove(filesToRemove);

      if (removeError) {
        console.error(`❌ Erro ao remover arquivos do bucket ${bucketName}:`, removeError.message);
      } else {
        console.log(`✅ Removidos ${removed?.length || 0} arquivos do bucket ${bucketName}.`);
      }

    } catch (err) {
      console.error(`❌ Erro inesperado no bucket ${bucketName}:`, err);
    }
  }

  console.log('\n✨ Limpeza do Storage concluída!');
}

cleanStorage();
