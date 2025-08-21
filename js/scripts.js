
// VARIABLES GLOBALES

let frasesDerrota = [];
let introText = {};
let jugador;
let pisoActual = 1;
let demonios = [];
let demonioSeleccionado = null;

// Cargar datos desde JSON 

fetch("./data/data.json")
  .then(res => res.json())
  .then(data => {
    frasesDerrota = data.frasesDerrota;
    introText = data.introHeroes;
  })
  .catch(err => console.error("Error cargando el JSON", err));


// FUNCIONES GENERALES DE PANTALLAS

function ocultarTodos() {
  document.querySelectorAll(".segmento").forEach(seg => seg.style.display = "none");
}

function mostrarSegmento(id) {
  document.querySelectorAll(".segmento").forEach(seg => seg.style.display = "none");
  document.getElementById(id).style.display = "block";
}


// EFECTO MAQUINA DE ESCRIBIR (INTRO)

window.onload = function () {
  const texto = document.getElementById("relato");
  const contenido = texto.textContent; // Guardamos el texto original
  texto.textContent = ""; // Lo vaciamos para escribirlo letra por letra
  let i = 0;

  function escribir() {
    if (i < contenido.length) {
      texto.textContent += contenido.charAt(i);
      i++;
      setTimeout(escribir, 40);
    }
  }

  escribir();
};

mostrarSegmento("tituloJuego");


// CLASES: HEROE Y DEMONIO

class Heroe {
  constructor(tipo) {
    this.nombre = "El héroe del silencio";
    this.tipo = tipo;
    this.nivel = 1;
    this.exp = 0;
    this.hp = 0;
    this.hpMax = 0;
    this.atkBasico = [0, 0];
    this.atkEspecial = [0, 0];
    this.probEspecial = 0;
    this.setStats();
  }

  setStats() {
    if (this.tipo === "espadachin") {
      this.hp = this.hpMax = 100;
      this.atkBasico = [10, 15];
      this.atkEspecial = [15, 20];
      this.probEspecial = 0.5;
    } else if (this.tipo === "mago") {
      this.hp = this.hpMax = 80;
      this.atkBasico = [5, 10];
      this.atkEspecial = [20, 30];
      this.probEspecial = 0.7;
    } else if (this.tipo === "arquero") {
      this.hp = this.hpMax = 90;
      this.atkBasico = [15, 25];
      this.atkEspecial = [10, 15];
      this.probEspecial = 0.3;
    }
  }

  atacar() {
    const usarEspecial = Math.random() < this.probEspecial;
    const [min, max] = usarEspecial ? this.atkEspecial : this.atkBasico;
    const danio = Math.floor(Math.random() * (max - min + 1)) + min;
    return {
      tipo: usarEspecial ? "especial" : "basico",
      danio
    };
  }

  recibirDanio(cantidad) {
    this.hp = Math.max(this.hp - cantidad, 0);
  }

  curar() {
    this.hp = this.hpMax;
  }
}

class Demonio {
  constructor(piso) {
    this.piso = piso;
    this.setStats();
  }

  setStats() {
    const hpMin = this.piso * 5;
    const hpMax = this.piso * 8;
    this.hp = Math.floor(Math.random() * (hpMax - hpMin + 1)) + hpMin + 40;
    this.atkBasico = this.piso + 5;
    this.atkEspecial = Math.floor(this.piso * 1.5) + 10;
    this.expOtorgada = Math.floor(Math.random() * 4 + 2) * this.piso;
  }

  atacar() {
    const usarEspecial = Math.random() < 0.4;
    const danio = usarEspecial ? this.atkEspecial : this.atkBasico;
    return {
      tipo: usarEspecial ? "especial" : "basico",
      danio
    };
  }

  recibirDanio(cantidad) {
    this.hp = Math.max(this.hp - cantidad, 0);
  }
}


// SELECCION DEL HEROE

document.querySelectorAll(".personaje").forEach(div => {
  div.addEventListener("click", () => {
    const tipo = div.dataset.tipo;
    jugador = new Heroe(tipo);

    document.getElementById("eleccionPersonaje").style.display = "none";
    document.getElementById("introHeroe").style.display = "block";

    // Usamos los datos cargados del JSON
    document.getElementById("textoIntro").textContent = introText[tipo];

    document.getElementById("botonIntro").addEventListener("click", () => {
      document.getElementById("introHeroe").style.display = "none";
      document.getElementById("mazmorra").style.display = "block";
      iniciarPiso();
    });
  });
});

// INICIO DE PISO

function iniciarPiso() {
  document.getElementById("pisoActual").textContent = pisoActual;

  demonios = [
    new Demonio(pisoActual),
    new Demonio(pisoActual),
    new Demonio(pisoActual)
  ];

  const enemigosContainer = document.querySelector(".enemigos");

  enemigosContainer.innerHTML = demonios.map((_, index) => `
    <div class="enemigo" data-index="${index}">
      <img src="./assets/demonio${index + 1}.webp" alt="demonio${index + 1}">
    </div>
  `).join("");

  document.querySelectorAll(".enemigo").forEach((div, index) => {
    div.addEventListener("click", () => {
      demonioSeleccionado = demonios[index];
      iniciarCombate();
    });
  });

  document.getElementById("botonSiguientePiso").style.display = "none";
  document.querySelector(".enemigos").style.display = "flex";
  document.getElementById("zonaCombate").style.display = "none";
}


// COMBATE

function iniciarCombate() {
  const zonaCombate = document.getElementById("zonaCombate");
  const salida = document.getElementById("textoCombate");
  salida.innerHTML = "";
  zonaCombate.style.display = "block";
  document.querySelector(".enemigos").style.display = "none";

  const log = msg => {
    salida.innerHTML += `<p>${msg}</p>`;
    salida.scrollTop = salida.scrollHeight;
  };

  log(`¡Comienza la batalla en el piso ${pisoActual}!`);

  while (jugador.hp > 0 && demonioSeleccionado.hp > 0) {
    const ataqueJugador = jugador.atacar();
    demonioSeleccionado.recibirDanio(ataqueJugador.danio);
    log(`${jugador.tipo} usa ataque ${ataqueJugador.tipo} e inflige ${ataqueJugador.danio} de daño. Demonio: ${demonioSeleccionado.hp} HP`);

    if (demonioSeleccionado.hp <= 0) break;

    const ataqueDemonio = demonioSeleccionado.atacar();
    jugador.recibirDanio(ataqueDemonio.danio);
    log(`Demonio usa ataque ${ataqueDemonio.tipo} e inflige ${ataqueDemonio.danio} de daño. ${jugador.tipo}: ${jugador.hp} HP`);
  }

  if (jugador.hp > 0) {
    log(`${jugador.tipo} ha vencido y gana ${demonioSeleccionado.expOtorgada} EXP.`);
    jugador.curar();
    log("El héroe se recupera totalmente para el próximo desafío.");

    if (pisoActual < 20) {
      const btn = document.getElementById("botonSiguientePiso");
      btn.style.display = "inline-block";
      btn.onclick = () => {
        pisoActual++;
        mostrarSegmento("mazmorra");
        iniciarPiso();
      };
    } else {
      // Ganó al Rey Demonio
      Swal.fire({
        title: "¡Has vencido al Rey Demonio!",
        text: "Tu nombre será recordado en la historia...",
        icon: "success",
        confirmButtonText: "Volver a intentar"
      }).then(() => {
        location.reload();
      });
    }
  }
  else {
    // Derrota
    const frase = frasesDerrota[Math.floor(Math.random() * frasesDerrota.length)];

    Swal.fire({
      title: "Has sido derrotado...",
      text: frase,
      icon: "error",
      confirmButtonText: "Reintentar"
    }).then(() => {
      location.reload();
    });
  }
}
