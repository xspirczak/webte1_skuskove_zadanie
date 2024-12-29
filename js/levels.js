let levels;

const fetchData = async () => {
    try {
        const response = await fetch('../assets/levels.json');
        //const response =  await fetch('https://webte1.fei.stuba.sk/~xspirczak/skuskove_zadanie/assets/levels.json');
        levels = await response.json();
        console.log('Levels fetched:', levels);

        initializeLocalStorage(levels);

        loadLevels(levels);
    } catch (error) {
        console.error('Error fetching levels:', error);
    }
};

window.addEventListener('DOMContentLoaded', fetchData);

const initializeLocalStorage = (levels) => {
    if(!localStorage.getItem('levels')){
        const levelsData = {};
        levels.forEach(level => {
           levelsData[level.id] = false;
        });
        localStorage.setItem('levels', JSON.stringify(levelsData));
    }

    if(!localStorage.getItem('coins')){
        const coinsData = {};
        levels.forEach(level => {
            coinsData[level.id] = 0;
        });
        localStorage.setItem('coins', JSON.stringify(coinsData));
    }

    if(!localStorage.getItem('times')){
        const timesData = {};
        levels.forEach(level => {
            timesData[level.id] = -1; // -1 signals no time yet
        });
        localStorage.setItem('times', JSON.stringify(timesData));
    }
};


const getBadgeColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
        case 'easy':
            return 'bg-success';
        case 'medium':
            return 'bg-warning';
        case 'hard':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
};

const redirectToLevel = (level) => {
    const levelQuery = `game.html?levelId=${encodeURIComponent(level.id)}`;
    window.location.replace(levelQuery);
};

const levelFinished = (levelId) => {
    const levelsData = JSON.parse(localStorage.getItem('levels'));

    if (!levelId)
        return true;

    for (let id = 1; id < Object.values(levelsData).length ; id++) {
        if (id === levelId) {
            if (levelsData[id-1] || levelId[id])
                return true;

            return false;
        }
    }
}

const coinsCollected = (levelId) => {
    const localStorageCoins = JSON.parse(localStorage.getItem('coins'));
    if (localStorageCoins)
        return localStorageCoins[levelId]
}

const displayStars = (levelId) => {
    let coins = coinsCollected(levelId);
    const starContainer = document.querySelectorAll('.starContainer')[levelId];

    const stars = starContainer.querySelectorAll('.star');

    stars.forEach(star => {
        if (coins) {
            star.classList.add('filled');
            coins -=1;
        }
    })
}

const bestTime = (levelId) => {
    const localStorageTimes = JSON.parse(localStorage.getItem('times'));
    if (localStorageTimes)
        return localStorageTimes[levelId]
}

const displayTimes = (levelId) => {
    let time = bestTime(levelId);

    const formatTime = (time) => {
        const minutes = Math.floor(time / 60); // Minúty
        const seconds = Math.floor(time % 60); // Sekundy

        return `${minutes}.${seconds.toString().padStart(2, '0')}`;
    };

    const bestTimeDiv = document.getElementById(`bestTime-${levelId}`);
    time === -1 ? bestTimeDiv.innerHTML = '-' : bestTimeDiv.innerHTML = formatTime(time);
}

const loadLevels = (levels) => {
    if (levels && Array.isArray(levels)) {
        const levelsDiv = document.getElementById('levels');
        levels.forEach(level => {
            const badgeColor = getBadgeColor(level.difficulty);

            const card = document.createElement('div');
            card.className = 'col-md-6 col-xl-4 col-9 mb-4';

            card.innerHTML = `
                    <div class="card shadow-sm w-75 mx-auto">
                        <div class="card-body d-flex justify-content-between align-items-center row">
                            <div class="col-lg-6 col-12">
                                <h5 class="card-title">${level.name}</h5>
                                <p class="card-text mb-0">
                                    Úroveň: <span class="badge ${badgeColor}">${level.difficulty.toUpperCase()}</span><br>
                                </p>
                                 <div class="starContainer justify-content-center mt-2 mb-1">
                                    <div class="star gold goldStar" id="star1"></div>
                                    <div class="star gold goldStar" id="star2"></div>
                                    <div class="star gold goldStar" id="star3"></div>                                    
                                </div>
                                <p class="card-text nb-0"><i class="fa-solid fa-clock"></i> <span id="bestTime-${level.id}"></span> minút</p>
                            </div>
                           <div class="col-lg-6 col-12">
                            ${levelFinished(level.id)
                                ? `<button class="btn button-78" id="btn-${level.id}">Hrať</button>`
                                : `<button class="btn btn-danger" id="btn-${level.id}" data-bs-toggle="tooltip" title="Na odomknutie dokončite predchadzajúci level" disabled><i class="fa-solid fa-lock"></i></button>`
                            }</div>
                            </div>
                    </div>
                `;
            levelsDiv.append(card);
            const button = document.getElementById(`btn-${level.id}`);
            button.addEventListener('click', () => {
                redirectToLevel(level)
            });
            displayStars(level.id);
            displayTimes(level.id);
        });
    } else {
        console.warn('No levels to load or levels is not an array.');
    }
};

