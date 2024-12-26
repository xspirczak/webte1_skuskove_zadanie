let levels;

const fetchData = async () => {
    try {
        const response = await fetch('../assets/levels.json');
        levels = await response.json();

    } catch (error) {
        console.error('Error fetching levels:', error);
    }
};

window.addEventListener('DOMContentLoaded', fetchData);

const getLevelIdToPlay = () => {
    if(!localStorage.getItem('levels')){

        const levelsData = {};
        levels.forEach(level => {
            levelsData[level.id] = false;
        });
        localStorage.setItem('levels', JSON.stringify(levelsData));
    }

    const levelsData = JSON.parse(localStorage.getItem('levels'));

    for(let levelId in levelsData){
        if(levelsData[levelId] === false){
            return levelId;
        }
    }
    return Math.floor(Math.random() * 5);
}

function play(){
    const levelId = getLevelIdToPlay();

    const levelQuery = `game.html?levelId=${levelId}`;
    window.location.replace(levelQuery);
}

