// Grid Generation
const gridContainer = document.getElementById('programmator-grid');

for (let i = 0; i < 100; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    gridContainer.appendChild(cell);
}

// Sprite Slicing and Carousel
const SPRITE_WIDTH = 50; // Ширина одного спрайта
const SPRITE_HEIGHT = 50; // Высота одного спрайта
const SPRITE_COUNT = 18; // Количество спрайтов в файле
const VISIBLE_SPRITES = 4; // Количество видимых спрайтов

const carouselTrack = document.querySelector('.carousel-track');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
let currentIndex = 0;

// Generate sprites
for (let i = 0; i < SPRITE_COUNT; i++) {
    const sprite = document.createElement('div');
    sprite.classList.add('sprite');
    // Сдвигаем фон для отображения нужного спрайта
    sprite.style.backgroundPosition = `-${i * SPRITE_WIDTH}px 0px`;
    carouselTrack.appendChild(sprite);
}

const sprites = document.querySelectorAll('.sprite');

function updateCarousel() {
    const offset = -currentIndex * SPRITE_WIDTH;
    carouselTrack.style.transform = `translateX(${offset}px)`;
}

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % (SPRITE_COUNT - VISIBLE_SPRITES + 1);
    updateCarousel();
});

prevBtn.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + (SPRITE_COUNT - VISIBLE_SPRITES + 1)) % (SPRITE_COUNT - VISIBLE_SPRITES + 1);
    updateCarousel();
});
