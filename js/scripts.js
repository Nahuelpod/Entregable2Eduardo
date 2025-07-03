
// ocultamos los segmentos y mostramos segun corresponda
function ocultarTodos() {
  document.querySelectorAll(".segmento").forEach(seg => seg.style.display = "none");
}

function mostrarSegmento(id) {
  document.querySelectorAll(".segmento").forEach(seg => seg.style.display = "none");
  document.getElementById(id).style.display = "block";
}

// funcion para efecto de maquina de escribir del relato intro
window.onload = function() {
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

// creacion del heroe 
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

  // Función para uso de ataques segun probabilidad
  atacar() {
    const usarEspecial = Math.random() < this.probEspecial;
    const [min, max] = usarEspecial ? this.atkEspecial : this.atkBasico; 
    const danio = Math.floor(Math.random() * (max - min + 1)) + min;
    return {
      tipo: usarEspecial ? "especial" : "basico",
      danio
    };
  }

  // Función para recibir daño
  recibirDanio(cantidad) {
    this.hp = Math.max(this.hp - cantidad, 0);
  }

  // Función para curar el heroe después de superar un piso
  curar() {
    this.hp = this.hpMax;
  }
}

// creacion del demonio
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




let jugador;
let pisoActual = 1;
let demonios = [];
let demonioSeleccionado = null;

//se asigna el heroe segun la eleccion y pasa al segmento introHeroe segun el heroe elegido
document.querySelectorAll(".personaje").forEach(div => {
  div.addEventListener("click", () => {
    const tipo = div.dataset.tipo;
    jugador = new Heroe(tipo);

    document.getElementById("eleccionPersonaje").style.display = "none";
    document.getElementById("introHeroe").style.display = "block";

    const introText = {
      espadachin: "Has elegido al Espadachín del Silencio, la hoja que corta sin advertencia. Entrenado en monasterios sombríos, aprendió que el ruido es debilidad y que el combate es un arte frío. Su espada no choca: desliza. Su mirada no arde: congela. En él, la calma y la muerte caminan juntas. Cuando habla el filo, el mundo calla.",
      mago: "Has elegido al Mago del Silencio, maestro de los susurros arcanos. Criado entre ruinas olvidadas, sus hechizos no retumban: se deslizan como sombras, destruyendo desde adentro. Su poder se manifiesta sin ruido, sin aviso… solo ruina. Nadie escucha su llegada, pero todos sienten su ausencia. Silencioso. Mortal. Incontrolable.",
      arquero: "Has elegido al Arquero del Silencio, cazador de lo invisible. Nacido entre las brumas eternas, sus pasos no crujen y su aliento no se ve. Sus flechas viajan sin sonido y golpean con la fuerza del destino. Jamás lo verás, y si lo haces, ya es tarde. El silencio es su arma… y su sentencia."
    };

    document.getElementById("textoIntro").textContent = introText[tipo];

    document.getElementById("botonIntro").addEventListener("click", () => {
      document.getElementById("introHeroe").style.display = "none";
      document.getElementById("mazmorra").style.display = "block";
      iniciarPiso();
    });
  });
});

// funcion para iniciar el piso de la mazmorra
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

// funcion para iniciar el combate
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
      mostrarSegmento("mazmorra"); // Volver a seleccionar demonio
      iniciarPiso();
    };
  } else {
    // Ganó al Rey Demonio
    setTimeout(() => {
      mostrarSegmento("pantallaFinal");
    }, 2000);
  }

    } else {
    // Derrota
    const frases = [
    "El silencio devoró tu alma... como a tantos otros que creyeron ser leyenda.",
    "Tu última palabra fue un suspiro que nadie escuchó. La mazmorra se burla en la penumbra.",
    "El Rey Demonio ni siquiera se levantó. Uno más cayó sin siquiera causar eco.",
    "Un rugido. Un golpe. Un fin. Jamás recordarán tu nombre.",
    "La oscuridad te tragó sin hacer ruido... irónico, ¿no?",
    "Tus huesos adornan ahora la entrada del piso 3. Ni siquiera llegaste lejos.",
    "El destino fue claro: no eras el héroe que esperaban. Solo otro intento fallido.",
    "Un demonio rió. El resto te destrozó. Fin.",
    "Tus cenizas alimentan el fuego del Rey Demonio. Qué útil resultaste, al final.",
    "El silencio vuelve a reinar... y tú fuiste su último susurro inútil."
    ];
    const frase = frases[Math.floor(Math.random() * frases.length)];
    document.getElementById("fraseDerrota").textContent = frase;

    setTimeout(() => {
        mostrarSegmento("pantallaDerrota");
    }, 2000);
    }
    
  }

