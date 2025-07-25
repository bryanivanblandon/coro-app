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
const auth = firebase.auth();

const cantoForm = document.getElementById("cantoForm");
const listaCantos = document.getElementById("cantosList");

// Mostrar formulario solo si hay usuario autenticado
firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    document.getElementById("cantoForm").style.display = "block";
  } else {
    document.getElementById("cantoForm").style.display = "none";
    const loginBtn = document.createElement("button");
    loginBtn.textContent = "Iniciar sesión para editar";
    loginBtn.onclick = login;
    document.body.prepend(loginBtn);
  }
});

// Login con correo electrónico (popup)
function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithPopup(provider)
    .then((result) => {
      alert(`Bienvenido, ${result.user.displayName}`);
    })
    .catch((error) => {
      alert("Error al iniciar sesión: " + error.message);
    });
}

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
    autor: firebase.auth().currentUser.email,
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
      <small><i>Subido por: ${data.autor || "Anónimo"}</i></small>
    `;
    listaCantos.appendChild(div);
  });
}

// Inicial
mostrarCantos();
