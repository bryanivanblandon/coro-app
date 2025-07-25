// Firebase Configuración y lógica de la app

// 1. Reemplaza esta configuración con la de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_DOMINIO.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_BUCKET.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

const cantoForm = document.getElementById("cantoForm");
const listaCantos = document.getElementById("cantosList");

// Manejar envío del formulario
cantoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const letra = document.getElementById("letra").value;
  const partitura = document.getElementById("partitura").files[0];
  const audio = document.getElementById("audio").files[0];

  let partituraURL = "";
  let audioURL = "";

  if (partitura) {
    const partituraRef = storage.ref(`partituras/${partitura.name}`);
    await partituraRef.put(partitura);
    partituraURL = await partituraRef.getDownloadURL();
  }

  if (audio) {
    const audioRef = storage.ref(`audios/${audio.name}`);
    await audioRef.put(audio);
    audioURL = await audioRef.getDownloadURL();
  }

  await db.collection("cantos").add({
    titulo,
    letra,
    partituraURL,
    audioURL,
    timestamp: new Date()
  });

  cantoForm.reset();
  mostrarCantos();
});

// Mostrar cantos
async function mostrarCantos() {
  listaCantos.innerHTML = "";
  const snapshot = await db.collection("cantos").orderBy("timestamp", "desc").get();
  snapshot.forEach((doc) => {
    const data = doc.data();
    const div = document.createElement("div");
    div.className = "canto";
    div.innerHTML = `
      <h3>${data.titulo}</h3>
      <pre>${data.letra}</pre>
      ${data.partituraURL ? `<a href="${data.partituraURL}" target="_blank">Ver Partitura</a>` : ""}
      ${data.audioURL ? `<audio controls src="${data.audioURL}"></audio>` : ""}
    `;
    listaCantos.appendChild(div);
  });
}

// Inicial
mostrarCantos();
