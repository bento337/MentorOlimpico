import { db } from "@/services/firebaseConfig";
import { doc, updateDoc, getDocs, collection } from "firebase/firestore";

export async function atualizarTodasMaterias() {
  console.log('🔄 Iniciando atualização em lote...');

  const configMaterias = {
    'ALGEBRAINTERM': {
      nome: 'Álgebra Intermediária',
      importancia: 9,
      tempo: '3 semanas',
      relevancia: 'Alta',
      OLIMPIADAS: ['OBMEP', 'OMIF', 'OIMSF']
    },
    'DIVISORESeMULTIPLOS': {
      nome: 'Divisores e Múltiplos', 
      importancia: 8,
      tempo: '2 semanas',
      relevancia: 'Alta',
      OLIMPIADAS: ['OBMEP', 'OMIF', 'OIMSF']
    },
    'EQ1GRAU': {
      nome: 'Equações do 1º Grau',
      importancia: 7,
      tempo: '2 semanas', 
      relevancia: 'Média',
      OLIMPIADAS: ['OBMEP', 'OMIF', 'OIMSF']
    },
    'EQ2GRAU': {
      nome: 'Equações do 2º Grau',
      importancia: 8,
      tempo: '2 semanas',
      relevancia: 'Alta',
      OLIMPIADAS: ['OBMEP', 'OMIF']
    },
    'FRACOES': {
      nome: 'Frações e Operações',
      importancia: 9,
      tempo: '3 semanas',
      relevancia: 'Alta',
      OLIMPIADAS: ['OBMEP', 'OIMSF']
    },
    'INEQUACOES': {
      nome: 'Inequações',
      importancia: 6,
      tempo: '1 semana',
      relevancia: 'Média', 
      OLIMPIADAS: ['OBMEP', 'OMIF']
    },
    'MMCeMDC': {
      nome: 'MMC e MDC',
      importancia: 8,
      tempo: '2 semanas',
      relevancia: 'Alta',
      OLIMPIADAS: ['OBMEP', 'OMIF', 'OIMSF']
    },
    'PORCENTAGEM': {
      nome: 'Porcentagem',
      importancia: 7,
      tempo: '2 semanas',
      relevancia: 'Média',
      OLIMPIADAS: ['OBMEP', 'OIMSF']
    },
    'PRIMOS': {
      nome: 'Números Primos',
      importancia: 6,
      tempo: '1 semana',
      relevancia: 'Média',
      OLIMPIADAS: ['OBMEP', 'OMIF']
    },
    'RAZAOePROPORCAO': {
      nome: 'Razão e Proporção',
      importancia: 7,
      tempo: '2 semanas',
      relevancia: 'Média',
      OLIMPIADAS: ['OBMEP', 'OMIF', 'OIMSF']
    }
  };

  try {
    const materiasRef = collection(db, "Materias");
    const snapshot = await getDocs(materiasRef);
    
    console.log(`📚 Encontrados ${snapshot.size} documentos`);

    const updates = [];
    
    snapshot.forEach((document) => {
      const docId = document.id;
      const novosDados = configMaterias[docId];
      
      if (novosDados) {
        console.log(`📝 Atualizando: ${docId}`);
        updates.push(updateDoc(doc(db, "Materias", docId), novosDados));
      } else {
        console.log(`⚠️  Config não encontrada para: ${docId}`);
      }
    });

    // Executa todas as atualizações
    await Promise.all(updates);
    
    console.log('✅ Todas as matérias foram atualizadas!');
    console.log('📊 Resumo:');
    
    Object.entries(configMaterias).forEach(([docId, dados]) => {
      console.log(`   📖 ${docId}: ${dados.nome}`);
      console.log(`      ⭐ Importância: ${dados.importancia}`);
      console.log(`      ⏱️  Tempo: ${dados.tempo}`);
      console.log(`      🎯 Relevância: ${dados.relevancia}`);
      console.log(`      🏆 Olimpíadas: ${dados.OLIMPIADAS.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ Erro na atualização:', error);
  }
}