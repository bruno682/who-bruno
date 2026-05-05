let images = []; // Array para guardar a imagem base e as facetas
let currentIndex = 0;

function preload() {
    // Carrega a imagem base e as novas imagens da pasta Facets/
    // IMPORTANTE: Ajuste os nomes (1.png, 2.png, etc) para os nomes reais dos seus arquivos
    images.push(loadImage('Facets/Port p mai.png'));
    images.push(loadImage('Facets/Port p mai1.png'));
    images.push(loadImage('Facets/Port p mai2.png'));
    images.push(loadImage('Facets/Port p mai3.png'));
    images.push(loadImage('Facets/Port p mai4.png'));
    images.push(loadImage('Facets/Port p mai5.png'));
    images.push(loadImage('Facets/Port p mai6.png'));
    images.push(loadImage('Facets/Port p mai7.png'));
    images.push(loadImage('Facets/Port p mai8.png'));
    images.push(loadImage('Facets/Port p mai9.png'));
    images.push(loadImage('Facets/Port p mai10.png'));
    images.push(loadImage('Facets/Port p mai11.png'));
    images.push(loadImage('Facets/Port p mai12.png'));
    images.push(loadImage('Facets/Port p mai13.png'));
    images.push(loadImage('Facets/Port p mai14.png'));
    images.push(loadImage('Facets/Port p mai15.png'));
    images.push(loadImage('Facets/Port p mai16.png'));
}

function setup() {
    // Cria o canvas usando o tamanho da primeira imagem
    createCanvas(images[0].width, images[0].height);
    
    // Configura o intervalo para mudar a imagem inteira a cada 1 segundo (1000 ms)
    setInterval(mudarImagem, 500);
}

function draw() {
    // Desenha a imagem atual na tela ocupando todo o espaço
    let img = images[currentIndex];
    if (img && img.width > 0) {
        image(img, 0, 0);
    }
}

function mudarImagem() {
    // Avança para a próxima imagem e volta para a primeira quando chegar no final da lista
    currentIndex = (currentIndex + 1) % images.length;
}