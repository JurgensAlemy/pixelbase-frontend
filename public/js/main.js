/* ==========================================================
   PIXELBASE - LÓGICA DE INTERFAZ (Frontend)
   ========================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. CARRUSEL PRINCIPAL (HERO) ---
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const btnPrev = document.querySelector('.slider-btn.prev');
    const btnNext = document.querySelector('.slider-btn.next');

    let currentSlide = 0;
    const totalSlides = slides.length;

    if(slides.length > 0) {
        const goToSlide = (index) => {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            currentSlide = (index + totalSlides) % totalSlides;
            slides[currentSlide].classList.add('active');
            dots[currentSlide].classList.add('active');
        };

        btnNext?.addEventListener('click', () => goToSlide(currentSlide + 1));
        btnPrev?.addEventListener('click', () => goToSlide(currentSlide - 1));
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => goToSlide(index));
        });

        // Cambio automático cada 5s
        setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    // --- 2. TEMPORIZADOR BUCLE (5 MIN) ---
    const minutesElement = document.getElementById('timer-minutes');
    const secondsElement = document.getElementById('timer-seconds');

    if(minutesElement && secondsElement) {
        const LOOP_TIME = 5 * 60;
        let timeLeft = LOOP_TIME;

        const updateTimer = () => {
            if (timeLeft < 0) timeLeft = LOOP_TIME;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            minutesElement.textContent = String(minutes).padStart(2, '0');
            secondsElement.textContent = String(seconds).padStart(2, '0');
            timeLeft--;
        };

        updateTimer();
        setInterval(updateTimer, 1000);
    }

    // --- 3. CARRUSEL DE PRODUCTOS (OFERTAS) ---
    const productSlides = document.querySelectorAll('.products-slide-deals');
    const btnPrevDeals = document.querySelector('.prev-deals');
    const btnNextDeals = document.querySelector('.next-deals');

    let currentProductSlide = 0;

    if(productSlides.length > 0) {
        const goToProductSlide = (index) => {
            productSlides.forEach(slide => slide.classList.remove('active'));
            currentProductSlide = (index + productSlides.length) % productSlides.length;
            productSlides[currentProductSlide].classList.add('active');
        };

        btnNextDeals?.addEventListener('click', () => goToProductSlide(currentProductSlide + 1));
        btnPrevDeals?.addEventListener('click', () => goToProductSlide(currentProductSlide - 1));
    }

    // --- 4. FILTRO DE LO MÁS VENDIDO ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sellerCards = document.querySelectorAll('.seller-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            sellerCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                if (filterValue === 'todos' || cardCategory === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
});
