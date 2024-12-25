let levels;

const fetchData = async () => {
    try {
        const response = await fetch('../assets/levels.json');
        levels = await response.json();
        console.log('Levels fetched:', levels);
        loadLevels(levels);
    } catch (error) {
        console.error('Error fetching levels:', error);
    }
};

window.addEventListener('DOMContentLoaded', fetchData);

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


const loadLevels = (levels) => {
    if (levels && Array.isArray(levels)) {
        const levelsDiv = document.getElementById('levels');
        levels.forEach(level => {
            const badgeColor = getBadgeColor(level.difficulty);

            const card = document.createElement('div');
            card.className = 'col-md-4 mb-4';

            card.innerHTML = `
                    <div class="card shadow-sm w-75 mx-auto">
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="card-title">${level.name}</h5>
                                <p class="card-text mb-0">
                                    Difficulty: <span class="badge ${badgeColor}">${level.difficulty.toUpperCase()}</span><br>
                                </p>
                            </div>
                            
                            <button class="btn btn-primary" id=btn-${level.id}>Hrať</button>
                        </div>
                    </div>
                `;
            levelsDiv.append(card);

            const button = document.getElementById(`btn-${level.id}`);
            button.addEventListener('click', () => {
                redirectToLevel(level)
            });
        });
    } else {
        console.warn('No levels to load or levels is not an array.');
    }
};



