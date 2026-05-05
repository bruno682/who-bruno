let tempo = 0
let hint
let frases = [
  {
    texto: "The struggle itself is enough.",
    autor: "Albert Camus",
    tempo: 200,
    px: 0.08,
    py: 0.10
  },
  {
    texto: "Becoming is better than being.",
    autor: "Friedrich Nietzsche",
    tempo: 350,
    px: 0.70,
    py: 0.90
  },
  {
    texto: "To begin is human.",
    autor: "Hannah Arendt",
    tempo: 500,
    px: 0.06,
    py: 0.55
  },
  {
    texto: "All things flow.",
    autor: "Heraclitus",
    tempo: 650,
    px: 0.65,
    py: 0.28
  },
 {
    texto: "No man ever steps in the same river twice.",
    autor: "Heraclitus",
    tempo: 750,
    px: 0.06,
    py: 0.26
  },
 {
    texto: "Soon you will have forgotten everything; soon everything will have forgotten you.",
    autor: "Marcus Aurelius",
    tempo: 850,
    px: 0.04,
    py: 0.85
  },
 {
    texto: "You are afraid of dying, and yet you do not know how to live.",
    autor: "Seneca",
    tempo: 950,
    px: 0.60,
    py: 0.12
  }
]
let autor = "Albert Camus"
let glitch = false
let glitchFrames = 0
let fim = false
let idleFrames = 10 // Começa em 20 para o ícone já iniciar visível

// --- Variáveis do Efeito de Rastro ---
let rastroColorido = [];
let rastroBranco = [];
let matiz = 0;
let tempoEfeito = 0; // Separado do 'tempo' principal para não afetar as frases
let tamanhoBrancoAtual = 22; 
let metaTamanhoBranco = 22;

function setup() {
  createCanvas(windowWidth, windowHeight)
  textAlign(CENTER, CENTER)
  textFont('Inter')
hint = select('#hint')
  colorMode(HSB, 360, 100, 100, 255)
}

function draw() {

  // ---------- ESTADO FINAL ----------
  if (fim) {
    background(0, 0, 100)

    textAlign(CENTER, CENTER)
    fill(0)

    let frasePrincipal = "Life is long, if you know how to use it."
    let fraseHover = "For dust you are, and to dust you shall return."

    let autorPrincipal = "Seneca"
    let autorHover = "Genesis 3:19"

    textSize(42)

    let x = width / 2
    let y = height / 2

    let largura = textWidth(frasePrincipal)
    let altura = 42

    let hover =
      mouseX > x - largura / 2 &&
      mouseX < x + largura / 2 &&
      mouseY > y - altura / 2 &&
      mouseY < y + altura / 2

    if (hover) {
      text(fraseHover, x, y)
      textSize(18)
      text(autorHover, x, y + 50)
    } else {
      text(frasePrincipal, x, y)
      textSize(20)
      text(autorPrincipal, x, y + 50)
    }

    return
  }

  background(0)

  // --- EFEITO DE RASTRO NO FUNDO ---
  if (!fim && !glitch) {
    matiz = (matiz + 1.2) % 360;
    tempoEfeito += 0.02;

    let parado = mouseX === pmouseX && mouseY === pmouseY;
    let distancia = dist(pmouseX, pmouseY, mouseX, mouseY);
    
    if (parado) {
      metaTamanhoBranco = 80;
    } else {
      metaTamanhoBranco = 22;
    }
    tamanhoBrancoAtual = lerp(tamanhoBrancoAtual, metaTamanhoBranco, 0.1);

    let fatorVelocidade = map(distancia, 0, 100, 1, 5, true); 
    let passos = parado ? 1 : max(distancia / 8, 1); 

    for (let i = 0; i < passos; i++) {
      let x = lerp(pmouseX, mouseX, i / passos);
      let y = lerp(pmouseY, mouseY, i / passos);
      
      let forcaDistorcao = parado ? 30 : 15;
      let offsetX = (noise(tempoEfeito, i * 0.1) - 0.5) * forcaDistorcao;
      let offsetY = (noise(tempoEfeito + 100, i * 0.1) - 0.5) * forcaDistorcao;

      rastroColorido.push(new ParticulaNebulosa(x + offsetX, y + offsetY, matiz, 40, 180, 1.3 * fatorVelocidade, false));
      
      if (!parado) {
         rastroBranco.push(new ParticulaNebulosa(x + offsetX * 0.5, y + offsetY * 0.5, 0, 20, 0, 2.5 * fatorVelocidade, true));
      }
    }

    desenharRastro(rastroColorido);
    desenharRastro(rastroBranco);
    desenharFocoBranco(mouseX, mouseY, tamanhoBrancoAtual);
  }

  // movimento do mouse
  let movimento = dist(mouseX, mouseY, pmouseX, pmouseY)

  if (movimento > 0.5) {
    tempo += 1.5
    idleFrames = 0
    hint.style('opacity', '0') // Esconde quando move
  } else {
    tempo -= 2
    idleFrames++
  }

  // Se o mouse ficou parado por pouco tempo (20 frames) e a experiência não acabou
  if (idleFrames > 20 && !fim) {
    hint.style('opacity', '0.6') // Mostra o mouse novamente
  }

  tempo = constrain(tempo, 0, 1300)

  // ---------- TELA INICIAL ----------
  if (tempo <= 0) {
    fill(0, 0, 100)
    textAlign(CENTER, CENTER)
    textSize(52)
    text("Keep moving", width / 2, height / 2)
    return
  }

// ---------- FRASES AO LONGO DO TEMPO ----------

textAlign(LEFT, TOP)
textSize(48)
fill(0, 0, 100)

for (let f of frases) {

  if (tempo > f.tempo) {

    let posX = f.px * width;
    let posY = f.py * height;

    let largura = textWidth(f.texto)
    let altura = 48

    let hover =
      mouseX > posX &&
      mouseX < posX + largura &&
      mouseY > posY &&
      mouseY < posY + altura

    if (hover) {
      text(f.autor, posX, posY)
    } else {
      text(f.texto, posX, posY)
    }
  }
}

// ---------- HALO PURO ----------

let tamanhoMax

if (tempo < 300) {
  // crescimento inicial rápido para ficar visível mais cedo
  tamanhoMax = map(tempo, 0, 300, 10, 380)

} else if (tempo < 800) {
  // crescimento normal
  tamanhoMax = map(tempo, 300, 800, 380, 740)

} else if (tempo < 950) {
  // aceleração (cresce rápido, mas ainda controlado)
  tamanhoMax = map(tempo, 800, 1050, 740, 1240)

} else if (tempo < 1150) {
  // excesso (cresce demais)
  tamanhoMax = map(tempo, 950, 1150, 1240, 1800)

} else {
  // colapso
  glitch = true
}

let hue = tempo % 360

noStroke()
for (let r = tamanhoMax; r > 0; r -= 6) {
  let alpha = map(r, 0, tamanhoMax, 12, 0)
  fill(hue, 100, 100, alpha)
  ellipse(width / 2, height / 2, r, r)
}

// ---------- GLITCH / COLAPSO ----------
if (glitch) {
  glitchFrames++

  // dois flashes brancos
  if (glitchFrames < 15 || (glitchFrames > 17 && glitchFrames < 20)) {
    background(0, 0, 100)
  }

  // muda a cor do botão 3D para preto no momento em que entra no estado final (fundo branco)
  if (glitchFrames === 26) {
    let logoContainer = document.getElementById('logo-container');
    if (logoContainer) logoContainer.setAttribute('data-color', '#222222');
  }

  // estado final
  if (glitchFrames > 25) {
    fim = true
  }
}


}

// --- FUNÇÕES E CLASSES DO RASTRO ---
function desenharRastro(lista) {
  for (let i = lista.length - 1; i >= 0; i--) {
    lista[i].atualizar();
    lista[i].desenhar();
    if (lista[i].estaMorto()) lista.splice(i, 1);
  }
}

class ParticulaNebulosa {
  constructor(x, y, h, tamIni, tamFim, velSumiço, ehBranco) {
    this.x = x;
    this.y = y;
    this.matiz = h;
    this.vida = 100;
    this.tamIni = tamIni;
    this.tamFim = tamFim;
    this.velSumiço = velSumiço;
    this.ehBranco = ehBranco;
    this.semente = random(1000);
    this.derivaY = random(-0.5, -0.1);
  }

  atualizar() {
    this.vida -= this.velSumiço;
    this.y += this.derivaY; 
    let variacao = noise(tempoEfeito + this.semente) * 20; 
    this.tamanhoAtual = map(this.vida, 100, 0, this.tamIni, this.tamFim) + variacao;
  }

  desenhar() {
    if (this.tamanhoAtual <= 0.1 || this.vida <= 0) return;
    let corCentro, corBorda;
    // O colorMode do world.js usa (HSB, 360, 100, 100, 255)
    // Vida vai de 100 a 0, então multiplicamos por 2.55 para escala de alpha 255
    if (this.ehBranco) {
      corCentro = color(0, 0, 100, this.vida * 2.55); 
      corBorda = color(0, 0, 100, 0);
    } else {
      corCentro = color(this.matiz, 90, 100, this.vida * 1.02); // 0.4 * 2.55
      corBorda = color(this.matiz, 90, 100, 0);
    }
    let foco = this.ehBranco ? 0.3 : 0.0;
    desenharCirculoEsfumado(this.x, this.y, this.tamanhoAtual, corCentro, corBorda, foco);
  }

  estaMorto() { return this.vida < 0; }
}

function desenharFocoBranco(x, y, d) {
  let corCentro = color(0, 0, 100, 255); 
  let corBorda = color(0, 0, 100, 0);
  let pulso = (noise(tempoEfeito * 3) - 0.5) * 8;
  desenharCirculoEsfumado(x, y, d + pulso, corCentro, corBorda, 0.4);
}

function desenharCirculoEsfumado(x, y, d, c1, c2, focoIntensidade) {
  let ctx = drawingContext;
  let raio = d / 2;
  if (raio <= 0.1) return;
  let grad = ctx.createRadialGradient(x, y, 0, x, y, raio);
  grad.addColorStop(0, c1.toString());   
  grad.addColorStop(focoIntensidade, c1.toString()); 
  grad.addColorStop(1, c2.toString());   
  ctx.fillStyle = grad;
  noStroke();
  ellipse(x, y, d * 1.1, d * 1.1);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}