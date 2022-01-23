let timer_start, timer_finish, timer_time, good_positions, best_route, blinking_pos, last_pos, wrong, speed, timerStart;
let game_started = false;
let streak = 0;
let max_streak = 0;
let best_time = 99.999;

const getCookieValue = (name) => (
    document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)')?.pop() || ''
)
let getMaxStreakFromCookie = () => {
    let str = getCookieValue('max-streak_casino_generator');
    if(str !== '')
        return parseInt(str, 10);
    else
        return 0;
}
let getBestTimeFromCookie = () => {
    let str = getCookieValue('best-time_casino_generator');
    if(str !== '')
        return parseFloat(str);
    else
        return 99.999;
}
max_streak = getMaxStreakFromCookie();
best_time = getBestTimeFromCookie();

const sleep = (ms, fn) => {return setTimeout(fn, ms)};

const range = (start, end, length = end - start + 1) => {
    return Array.from({length}, (_, i) => start + i)
}

const random = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

// Options
document.querySelector('#speed').addEventListener('input', function(ev){
    document.querySelector('.speed_value').innerHTML = ev.target.value + 's';
    streak = 0;
    reset();
});

// Resets
document.querySelector('.btn_again').addEventListener('click', function(){
    streak = 0;
    reset();
});

function listener(ev){
    if(!game_started) return;
    
    let pos_clicked = parseInt(ev.target.dataset.position);
    if(pos_clicked === 0) return;
    
    if(last_pos === 0){
        document.querySelectorAll('.group.breathing')
            .forEach(el => { el.classList.remove('breathing') });
        document.querySelector('.groups').classList.add('transparent');
        
        if(pos_clicked === blinking_pos || pos_clicked === blinking_pos * 7){
            last_pos = pos_clicked;
            ev.target.classList.add('good');
        }else{
            wrong++;
            ev.target.classList.add('bad');
        }
    }else{
        let pos_jumps = parseInt(document.querySelectorAll('.group')[last_pos].innerText, 10);
        let maxV = maxVertical(last_pos);
        let maxH = maxHorizontal(last_pos);
        
        if(pos_jumps <= maxH && pos_clicked === last_pos + pos_jumps){
            last_pos = pos_clicked;
            ev.target.classList.add('good');
        }else if(pos_jumps <= maxV && pos_clicked === last_pos + (pos_jumps * 7)){
            last_pos = pos_clicked;
            ev.target.classList.add('good');
        }else{
            wrong++;
            ev.target.classList.add('bad');
        }
    }

    check();
}

function addListeners(){
    document.querySelectorAll('.group').forEach(el => {
        el.addEventListener('mousedown', listener);
    });
}

function check(){
    if(wrong === 3){
        resetTimer();
        game_started = false;
        streak = 0;

        document.querySelector('.groups').classList.remove('transparent');
        let blocks = document.querySelectorAll('.group');
        good_positions.push(48);
        good_positions.forEach( pos => {
            blocks[pos].classList.add('proper');
        });
        return;
    }
    if(last_pos === 48){
        stopTimer();
        streak++;
        if(streak > max_streak){
            max_streak = streak;
            document.cookie = "max-streak_casino_generator="+max_streak;
        }
        let time = document.querySelector('.streaks .time').innerHTML;
        if(parseFloat(time) < best_time){
            best_time = parseFloat(time);
            document.cookie = "best-time_casino_generator="+best_time;
        }
        reset();
    }
}

function maxVertical(pos){
    return Math.floor((48-pos)/7);
}
function maxHorizontal(pos){
    let max = (pos+1) % 7;
    if(max > 0) return 7-max;
        else return 0;
}
function generateNextPosition(pos){
    let maxV = maxVertical(pos);
    let maxH = maxHorizontal(pos);
    if( maxV === 0 ){
        let new_pos = random(random(1, maxH), maxH);
        return [new_pos, pos+new_pos];
    }
    if( maxH === 0 ){
        let new_pos = random(random(1, maxV), maxV);
        return [new_pos, pos+(new_pos*7)];
    }
    if( random(1,1000) % 2 === 0 ){
        let new_pos = random(random(1, maxH), maxH);
        return [new_pos, pos+new_pos];
    }else{
        let new_pos = random(random(1, maxV), maxV);
        return [new_pos, pos+(new_pos*7)];
    }
}

function generateBestRoute(start_pos){
    let route = [];
    if( random(1,1000) % 2 === 0 ){
        start_pos *= 7;
    }
    while(start_pos < 48){
        let new_pos = generateNextPosition(start_pos);
        route[start_pos] = new_pos[0];
        start_pos = new_pos[1];
    }
    
    return route;
}

function reset(){
    game_started = false;
    last_pos = 0;

    resetTimer();
    clearTimeout(timer_start);
    clearTimeout(timer_finish);

    max_streak = getMaxStreakFromCookie();
    best_time = getBestTimeFromCookie();

    document.querySelector('.splash').classList.remove('hidden');
    document.querySelector('.groups').classList.add('hidden');
    document.querySelector('.groups').classList.remove('transparent');

    document.querySelectorAll('.group').forEach(el => { el.remove(); });

    start();
}

function start(){
    wrong = 0;
    last_pos = 0;
    
    blinking_pos = random(1,4);
    best_route = generateBestRoute(blinking_pos);
    good_positions = Object.keys(best_route);

    let div = document.createElement('div');
    div.classList.add('group');
    const groups = document.querySelector('.groups');
    for(let i=0; i < 49; i++){
        let group = div.cloneNode();
        group.dataset.position = i.toString();
        let text;
        switch(i){
            case 0:
                text = '&#xf796;';break;
            case 48:
                text = '&#xf6ff;';break;
            case blinking_pos:
            case (blinking_pos*7):
                group.classList.add('breathing');
                text = random(1,4);
                break;
            default:
                text = random(1,5);
        }
        if( good_positions.includes( i.toString() ) ){
            text = best_route[i];
        }
        group.innerHTML = text;
        groups.appendChild(group);
    }

    addListeners();

    document.querySelector('.streak').innerHTML = streak;
    document.querySelector('.max_streak').innerHTML = max_streak;
    document.querySelector('.best_time').innerHTML = best_time;

    timer_start = sleep(2000, function(){
        document.querySelector('.splash').classList.add('hidden');
        document.querySelector('.groups').classList.remove('hidden');
        
        game_started = true;

        startTimer();
        speed = document.querySelector('#speed').value;
        timer_finish = sleep((speed * 1000), function(){
            game_started = false;
            wrong = 3;
            check();
        });
    });
}

function startTimer(){
    timerStart = new Date();
    timer_time = setInterval(timer,1);
}
function timer(){
    let timerNow = new Date();
    let timerDiff = new Date();
    timerDiff.setTime(timerNow - timerStart);
    let ms = timerDiff.getMilliseconds();
    let sec = timerDiff.getSeconds();
    if (ms < 10) {ms = "00"+ms;}else if (ms < 100) {ms = "0"+ms;}
    document.querySelector('.streaks .time').innerHTML = sec+"."+ms;
}
function stopTimer(){
    clearInterval(timer_time);
}
function resetTimer(){
    clearInterval(timer_time);
    document.querySelector('.streaks .time').innerHTML = '0.000';
}

start();