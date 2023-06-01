function novoElemento(tagName, className) {
    const elemento = document.createElement(tagName);
    elemento.className = className;
    return elemento;
};

function barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira');

    const borda = novoElemento('div', 'borda');
    const corpo = novoElemento('div', 'corpo');
    this.elemento.appendChild(reversa ? corpo : borda);
    this.elemento.appendChild(reversa ? borda : corpo);

    this.setAltura = altura => corpo.style.height = `${altura}px`;
};

// const newBarreira = new barreira(false);
// newBarreira.setAltura(200);
// document.querySelector('[wm-flappy]').appendChild(newBarreira.elemento);

function parDeBarreira(altura, abertura, x) {
    // o this server para ficar visivel fora da função;
    this.elemento = novoElemento('div', 'par-de-barreiras');

    this.superior = new barreira(true);
    this.inferior = new barreira(false);

    this.elemento.appendChild(this.superior.elemento);
    this.elemento.appendChild(this.inferior.elemento);

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura);
        const alturaInferior = altura - abertura - alturaSuperior;

        this.superior.setAltura(alturaSuperior);
        this.inferior.setAltura(alturaInferior);
    };

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0]);
    this.setX = x => this.elemento.style.left = `${x}px`;
    this.getLargura = () => this.elemento.clientWidth;

    this.sortearAbertura();
    this.setX(x);
};

// const newBarreira = new parDeBarreira(700, 200, 400);
// document.querySelector('[wm-flappy]').appendChild(newBarreira.elemento);

function barreirasPlus(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new parDeBarreira(altura, abertura, largura),
        new parDeBarreira(altura, abertura, largura + espaco),
        new parDeBarreira(altura, abertura, largura + espaco * 2),
        new parDeBarreira(altura, abertura, largura + espaco * 3)
    ];

    const deslocamento = 3;
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento);

            // quando o elemento sair da area do jogo

            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length);
                par.sortearAbertura();
            }

            const meio = largura / 2;
            const cruzouMeio = par.getX() + deslocamento >= meio && par.getX() < meio;
            if (cruzouMeio) notificarPonto();
        });
    };
};

function createBird(heightGame) {
    let fly = false;

    this.elemento = novoElemento('img', 'bird');
    this.elemento.src = './assets/passaro.png';

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0]);
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => fly = true;
    window.onkeyup = e => fly = false;

    this.animate = () => {
        const newY = this.getY() + (fly ? 8 : -5);
        const heightMax = heightGame - this.elemento.clientHeight;

        if (newY <= 0) {
            this.setY(0);
        } else if (newY >= heightMax) {
            this.setY(heightMax);
        } else {
            this.setY(newY);
        }
    };

    this.setY(heightGame / 2);

};
// const barreiras = new barreirasPlus(700, 1200, 200, 400);
// const bird = new createBird(700);
// const areaDoJogo = document.querySelector('[wm-flappy]');

// areaDoJogo.appendChild(bird.elemento);
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));
// setInterval(() => {
//      barreiras.animar();
//      bird.animate();
//  }, 20);

function progess() {
    this.elemento = novoElemento('span', 'progesso');
    this.atualizarPontos = pontos => {
        this.elemento.innerHTML = pontos;
    };

    this.atualizarPontos(0)
};

// const barreiras = new barreirasPlus(700, 1200, 200, 400);
// const bird = new createBird(700);
// const areaDoJogo = document.querySelector('[wm-flappy]');

// areaDoJogo.appendChild(new progess().elemento);
// areaDoJogo.appendChild(bird.elemento);
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));
// setInterval(() => {
//     barreiras.animar();
//     bird.animate();
// }, 20);
function estaoSobrePostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect();
    const b = elementoB.getBoundingClientRect();

    const horizontal = a.left + a.width >= b.left && b.left + b.width >= a.left;
    const vertical = a.top + a.height >= b.top && b.top + b.height >= a.top;
    return horizontal && vertical;
};

function colidiu(passaro, barreiras) {
    let colidiu = false;
    barreiras.pares.forEach(parDeBarreiras => {
        if (!colidiu) {
            const superior = parDeBarreiras.superior.elemento;
            const inferior = parDeBarreiras.inferior.elemento;
            colidiu = estaoSobrePostos(passaro.elemento, superior) || estaoSobrePostos(passaro.elemento, inferior)
        }
    });

    return colidiu;
};

function flappyBird() {
    let pontos = 0;

    const areaDoJogo = document.querySelector('[wm-flappy]');
    const altura = areaDoJogo.clientHeight;
    const largura = areaDoJogo.clientWidth;

    const progesso = new progess();
    const barreiras = new barreirasPlus(altura, largura, 200, 400, 
        () => { 
            return progesso.atualizarPontos(++pontos);
        });
    
    const bird = new createBird(altura);

    areaDoJogo.appendChild(progesso.elemento)
    areaDoJogo.appendChild(bird.elemento);
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento));

    this.startGame = () => {
        const temporizador = setInterval(() => {
            barreiras.animar();
            bird.animate();

            if (colidiu(bird, barreiras)) {
                clearInterval(temporizador);
            }
        }, 20);
    };
};

new flappyBird().startGame();