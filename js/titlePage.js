const getLevelIdToPlay = () => {
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

