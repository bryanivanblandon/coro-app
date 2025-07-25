// Firebase Configuración y lógica de la app

// 1. Reemplaza esta configuración con la de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBTHoPbE7OoqUyiUlLUwnwmOVTTtrXaiTk",
  authDomain: "coro-santa-cecilia.firebaseapp.com",
  projectId: "coro-santa-cecilia",
  storageBucket: "coro-santa-cecilia.firebasestorage.app",
  messagingSenderId: "35222391277",
  appId: "1:35222391277:web:3720752d606ece4a92ffe4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const storage = firebase.storage();

function mostrarSeccion(id) {
  const secciones = document.querySelectorAll("main section");
  secciones.forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// Guardar canto
document.getElementById("cantoForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const titulo = document.getElementById("titulo").value;
  const letra = document.getElementById("letra").value;
  const partituraFile = document.getElementById("partitura").files[0];
  const audioFile = document.getElementById("audio").files[0];

  const cantoRef = await db.collection("cantos").add({ titulo, letra, fecha: new Date() });
  const id = cantoRef.id;

  if (partituraFile) {
    const partRef = storage.ref().child(`partituras/${id}_${partituraFile.name}`);
    await partRef.put(partituraFile);
    const url = await partRef.getDownloadURL();
    await cantoRef.update({ partituraUrl: url });
  }
  if (audioFile) {
    const audRef = storage.ref().child(`audios/${id}_${audioFile.name}`);
    await audRef.put(audioFile);
    const url = await audRef.getDownloadURL();
    await cantoRef.update({ audioUrl: url });
  }

  alert("Canto guardado correctamente");
  document.getElementById("cantoForm").reset();
  cargarCantos();
});

// Cargar cantos
async function cargarCantos() {
  const contenedor = document.getElementById("cantosList");
  contenedor.innerHTML = "";
  const snapshot = await db.collection("cantos").orderBy("fecha", "desc").get();
  snapshot.forEach(doc => {
    const data = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${data.titulo}</h3>
      <pre>${data.letra}</pre>
      ${data.partituraUrl ? `<a href="${data.partituraUrl}" target="_blank">Ver Partitura</a>` : ""}
      ${data.audioUrl ? `<audio controls src="${data.audioUrl}"></audio>` : ""}
      <hr>
    `;
    contenedor.appendChild(div);
  });
}

// Buscar y filtrar cantos
function filtrarCantos() {
  const filtro = document.getElementById("busqueda").value.toLowerCase();
  const cantos = document.querySelectorAll("#cantosList > div");
  cantos.forEach(div => {
    const texto = div.textContent.toLowerCase();
    div.style.display = texto.includes(filtro) ? "block" : "none";
  });
}

// Transponer acordes
function transponerSeleccion() {
  const semitonos = parseInt(document.getElementById("transporte").value);
  if (semitonos === 0) return cargarCantos();
  const cantos = document.querySelectorAll("#cantosList > div pre");
  cantos.forEach(pre => {
    pre.textContent = transponer(pre.textContent, semitonos);
  });
}

const notas = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
function transponer(texto, cambio) {
  return texto.replace(/\[([A-G]#?)\]/g, (_, acorde) => {
    let i = notas.indexOf(acorde);
    if (i < 0) return `[${acorde}]`;
    return `[${notas[(i + cambio + 12) % 12]}]`;
  });
}

// Guardar agenda
document.getElementById("agendaForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const agenda = {
    fecha: document.getElementById("fecha").value,
    entrada: document.getElementById("entrada").value,
    ofertorio: document.getElementById("ofertorio").value,
    comunion: document.getElementById("comunion").value,
    salida: document.getElementById("salida").value
  };
  await db.collection("agendas").add(agenda);
  alert("Agenda guardada correctamente");
  document.getElementById("agendaForm").reset();
  cargarAgendas();
});

async function cargarAgendas() {
  const lista = document.getElementById("agendasList");
  lista.innerHTML = "";
  const snap = await db.collection("agendas").orderBy("fecha", "desc").get();
  snap.forEach(doc => {
    const a = doc.data();
    const div = document.createElement("div");
    div.innerHTML = `
      <h4>Agenda ${a.fecha}</h4>
      <ul>
        <li><strong>Entrada:</strong> ${a.entrada}</li>
        <li><strong>Ofertorio:</strong> ${a.ofertorio}</li>
        <li><strong>Comunión:</strong> ${a.comunion}</li>
        <li><strong>Salida:</strong> ${a.salida}</li>
      </ul><hr>
    `;
    lista.appendChild(div);
  });
}

// Inicializar
window.onload = () => {
  mostrarSeccion("inicio");
  cargarCantos();
  cargarAgendas();
};
