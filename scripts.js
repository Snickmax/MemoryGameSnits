let bestStats = {
    2: { moves: Infinity, time: Infinity },
    4: { moves: Infinity, time: Infinity },
    6: { moves: Infinity, time: Infinity },
    8: { moves: Infinity, time: Infinity },
    10: { moves: Infinity, time: Infinity },
}; // Para almacenar los mejores movimientos por tamaño de tablero

let moves = 0; // Variable para contar movimientos
let matchedPairs = 0; // Variable para contar pares coincidentes
let firstCard, secondCard; // Variables para las cartas seleccionadas
let lockBoard = false; // Para evitar que se puedan hacer clics en el tablero
let startTime; // Para almacenar el tiempo de inicio
let timerInterval; // Intervalo del temporizador


function startGame() {
    const size = document.getElementById('grid-size').value;
    const board = document.getElementById('game-board');
    const movesCounter = document.getElementById('moves');
    const status = document.getElementById('status');

    // Reiniciar juego
    moves = 0;
    matchedPairs = 0;
    firstCard = null;
    secondCard = null;
    lockBoard = false;
    movesCounter.textContent = '0';
    status.textContent = '';
    document.getElementById('time').textContent = '0'; // Reiniciar el tiempo

    // Iniciar temporizador
    startTime = new Date(); // Guardar el tiempo de inicio
    startTimer(); // Iniciar el temporizador

    // Limpiar tablero
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${size}, 1fr)`;

    const numCards = size * size;
    let cardsArray = generateCardsArray(numCards);
    shuffle(cardsArray);

    // Crear tablero de cartas
    for (let i = 0; i < numCards; i++) {
        const card = document.createElement('div');
        card.classList.add('grid-item');
        card.setAttribute('data-symbol', cardsArray[i]);
        card.addEventListener('click', revealCard);
        board.appendChild(card);
    }

    closeStartModal(); // Cierra el modal al iniciar el juego
    closeWinModal();
}

function startTimer() {
    timerInterval = setInterval(() => {
        const currentTime = Math.floor((new Date() - startTime) / 1000);
        document.getElementById('time').textContent = currentTime; // Actualiza el tiempo mostrado
    }, 1000);
}

// Función para generar el array de cartas según el tema seleccionado
function generateCardsArray(numCards) {
    const theme = document.querySelector('.theme.selected').getAttribute('data-theme'); // Obtener el tema seleccionado
    const numPairs = numCards / 2;
    let cardsArray = [];

    for (let i = 1; i <= numPairs; i++) {
        let symbol;

        switch (theme) {
            case 'numbers':
                symbol = i; // Números
                break;
            case 'letters':
                symbol = String.fromCharCode(64 + i); // Letras (A, B, C...)
                break;
            case 'symbols':
                symbol = String.fromCharCode(33 + i); // Símbolos
                break;
            case 'emojis':
                symbol = String.fromCodePoint(0x1F600 + i); // Emojis
                break;
            default:
                symbol = i; // Por defecto números
        }

        cardsArray.push(symbol);
        cardsArray.push(symbol); // Crear el par
    }

    return cardsArray;
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function revealCard() {
    if (lockBoard) return;
    if (this === firstCard) return; // No se puede hacer clic en la misma carta dos veces

    this.classList.add('revealed');
    this.textContent = this.getAttribute('data-symbol');

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    checkForMatch();
}

function checkForMatch() {
    const isMatch = firstCard.getAttribute('data-symbol') === secondCard.getAttribute('data-symbol');
    isMatch ? disableCards() : unflipCards();
    updateMoves();
}

function disableCards() {
    firstCard.classList.add('matched');
    secondCard.classList.add('matched');
    firstCard.removeEventListener('click', revealCard);
    secondCard.removeEventListener('click', revealCard);
    matchedPairs++;

    resetBoard();
    checkForWin();
}

function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('revealed');
        secondCard.classList.remove('revealed');
        firstCard.textContent = '';
        secondCard.textContent = '';
        resetBoard();
    }, 1000);
}

function resetBoard() {
    [firstCard, secondCard] = [null, null];
    lockBoard = false;
}

function updateMoves() {
    moves++;
    document.getElementById('moves').textContent = moves;
}

function checkForWin() {
    const size = document.getElementById('grid-size').value;
    const totalPairs = (size * size) / 2;

    if (matchedPairs === totalPairs) {
        clearInterval(timerInterval); // Detener el temporizador al ganar
        endTime = new Date();
        const totalTime = Math.floor((endTime - startTime) / 1000); // Tiempo en segundos

        // Comprobar y actualizar los mejores movimientos y tiempos
        if (moves < bestStats[size].moves) {
            bestStats[size].moves = moves;
            bestStats[size].time = totalTime; // Actualiza el mejor tiempo
        } else if (moves === bestStats[size].moves && totalTime < bestStats[size].time) {
            bestStats[size].time = totalTime; // Actualiza el tiempo si es mejor
        }

        updateBestStats(size); // Actualiza la visualización de las mejores estadísticas

        showWinModal(moves, totalTime);
    }
}

function showWinModal(moves, totalTime) {
    const modal = document.getElementById('winModal');
    const finalStats = document.getElementById('finalStats');

    finalStats.textContent = `Movimientos: ${moves}, Tiempo: ${totalTime} segundos`;
    modal.style.display = "block"; // Mostrar modal
}

function closeWinModal() {
    const modal = document.getElementById('winModal');
    modal.style.display = "none"; // Ocultar modal
}

function closeStartModal() {
    const modal = document.getElementById('startModal');
    modal.style.display = "none"; // Ocultar modal
}

function openStartModal() {
    closeWinModal(); // Cerrar el modal de victoria antes de abrir el de inicio
    closeStartModal(); // Cerrar el modal inicial
    document.getElementById('startModal').style.display = "block"; // Abrir modal de inicio
}

function exitGame() {
    // Cerrar el juego y mostrar el modal de inicio
    document.getElementById('game-board').innerHTML = '';
    openStartModal(); // Mostrar modal de inicio
    alert('Gracias por jugar!'); // Mensaje de salida
}

function updateBestStats(selectedSize) {
    const bestStatsDisplay = document.getElementById('bestStats');
    
    const stats = bestStats[selectedSize];
    const movesText = stats.moves < Infinity ? `${stats.moves} movimientos` : `N/A movimientos`;
    const timeText = stats.time < Infinity ? `${stats.time} segundos` : `N/A segundos`;

    bestStatsDisplay.textContent = `${selectedSize}x${selectedSize}: ${movesText}, Tiempo: ${timeText}`;
}
