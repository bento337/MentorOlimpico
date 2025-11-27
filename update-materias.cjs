const admin = require('firebase-admin');

const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function updateMaterias() {
  const relevancias = {
    "ALGEBRAINTERM": {"OBMEP": 9, "OMIF": 8, "OIMSF": 5},
    "COMBMEDIA": {"OBMEP": 6, "OMIF": 7, "OIMSF": 8},
    "COMBSIMPLES": {"OBMEP": 7, "OMIF": 8, "OIMSF": 9},
    "DIVISORESeMULTIPLOS": {"OBMEP": 8, "OMIF": 6, "OIMSF": 4},
    "EQ1GRAU": {"OBMEP": 9, "OMIF": 7, "OIMSF": 5},
    "EQ2GRAU": {"OBMEP": 8, "OMIF": 9, "OIMSF": 4},
    "ESTRATEGIAS": {"OBMEP": 7, "OMIF": 6, "OIMSF": 9},
    "FRACOES": {"OBMEP": 8, "OMIF": 7, "OIMSF": 6},
    "FUNCOES": {"OBMEP": 6, "OMIF": 9, "OIMSF": 4},
    "GEOMESPACIAL": {"OBMEP": 7, "OMIF": 8, "OIMSF": 4},
    "GEOMPLANA": {"OBMEP": 9, "OMIF": 8, "OIMSF": 6},
    "GRAFICOSTABELAS": {"OBMEP": 6, "OMIF": 5, "OIMSF": 7},
    "INEQUACOES": {"OBMEP": 7, "OMIF": 8, "OIMSF": 5},
    "MMCeMDC": {"OBMEP": 7, "OMIF": 6, "OIMSF": 4},
    "PA": {"OBMEP": 6, "OMIF": 8, "OIMSF": 5},
    "PG": {"OBMEP": 5, "OMIF": 7, "OIMSF": 4},
    "POMBOS": {"OBMEP": 6, "OMIF": 7, "OIMSF": 8},
    "PORCENTAGEM": {"OBMEP": 8, "OMIF": 7, "OIMSF": 6},
    "PRIMOS": {"OBMEP": 7, "OMIF": 6, "OIMSF": 4},
    "PROBAVANCADO": {"OBMEP": 5, "OMIF": 7, "OIMSF": 8},
    "PROBBASICA": {"OBMEP": 6, "OMIF": 6, "OIMSF": 7},
    "RAZAOePROPORCAO": {"OBMEP": 8, "OMIF": 7, "OIMSF": 6},
    "SEQS": {"OBMEP": 5, "OMIF": 6, "OIMSF": 5},
    "TEOREMAS": {"OBMEP": 6, "OMIF": 8, "OIMSF": 7}
  };

  const batch = db.batch();
  
  Object.entries(relevancias).forEach(([docId, valores]) => {
    const docRef = db.collection('Materias').doc(docId);
    batch.set(docRef, { relevanciaEspecifica: valores }, { merge: true });
  });

  await batch.commit();
  console.log('✅ Todas as 24 matérias foram criadas/atualizadas com sucesso!');
}

updateMaterias().catch(console.error);
