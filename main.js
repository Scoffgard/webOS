console.log('Script loaded !');

const windowNameElement = document.getElementById('windowName');
const fullScreenBar = document.getElementById('fullscreen');
const hourEle = document.getElementById('hour');
const mainmenu = document.getElementById('mainmenu');

let apps = [];
fetch('./apps/apps-list.json')
    .then(response => response.json())
    .then(data => {
        apps = data;
        const mainMenuList = document.getElementById('list');
        for(let app of data) {
            const entry = document.createElement('span');
            entry.classList.add('menuApp');
            entry.onclick = () => {createNewWindow(data.indexOf(app))};
            const img = document.createElement('img');
            img.src = app.icon;
            entry.appendChild(img);
            const p = document.createElement('p');
            p.innerHTML = app.name;
            entry.appendChild(p);

            mainMenuList.appendChild(entry);
        }
    });

let isMoving = false;
let isResizing = false;
let fullSize = false;
let x = 0;
let y = 0;

let mouseMarge = {
    x: 0,
    y: 0
};

let windowInfo = {};

let actualTarget;

document.addEventListener('mousedown', e => {
    x = e.clientX;
    y = e.clientY;

    tryLaunchMove(e.originalTarget, x, y);
});


setInterval(() => {
    date = new Date();
    hourEle.innerHTML = `${date.getHours().toLenght(2)}:${date.getMinutes().toLenght(2)}<br />${date.getDate().toLenght(2)}/${(date.getMonth() + 1).toLenght(2)}/${date.getFullYear()}`;
}, 1000);

document.addEventListener('mousemove', e => {
    if (isMoving === true) {
        x = e.clientX - mouseMarge.x;
        y = e.clientY - mouseMarge.y;

        if (windowInfo[actualTarget.id].fullScreen === true) {
            actualTarget.style.width = `${windowInfo[actualTarget.id].size[0]}px`;
            actualTarget.style.height = `${windowInfo[actualTarget.id].size[1]}px`;
            windowInfo[actualTarget.id].fullScreen = false;
        }

        if (e.clientY >= -20 && e.clientY <= 20) {
            windowInfo[actualTarget.id].allowFullScreen = true;
            if (fullScreenBar.classList.contains('fullscreen')) return;
            fullScreenBar.classList.add('fullscreen');
        } else {
            if (fullScreenBar.classList.contains('fullscreen')) fullScreenBar.classList.remove('fullscreen');
            windowInfo[actualTarget.id].allowFullScreen = false;
        }

        if (e.clientX - 5 < 0 || e.clientX + 5 > window.innerWidth || e.clientY - 5 < 0 || e.clientY + 50 > window.innerHeight) return;

        actualTarget.style.top = `${y}px`;
        actualTarget.style.left = `${x}px`;
    } else if (isResizing === true) {
        x = e.clientX + mouseMarge.x;
        y = e.clientY + mouseMarge.y;

        if (e.clientX - 5 < 0 || e.clientX + 5 > window.innerWidth || e.clientY - 5 < 0 || e.clientY + 50 > window.innerHeight) return;

        actualTarget.style.width = `${x - actualTarget.style.left.slice(0, -2)}px`;
        actualTarget.style.height = `${y - actualTarget.style.top.slice(0, -2)}px`;
    }
});


document.addEventListener('mouseup', e => {
    actualTarget.children[1].children[0].classList.remove('moving');
    if (isMoving === true) {
        isMoving = false;
        if (windowInfo[actualTarget.id].allowFullScreen === true) {
            actualTarget.style.left = '0px';
            actualTarget.style.top = '0px';
            actualTarget.style.width = `${window.innerWidth}px`;
            actualTarget.style.height = `${window.innerHeight - 52}px`;
            windowInfo[actualTarget.id].fullScreen = true;
            if (fullScreenBar.classList.contains('fullscreen')) {
                fullScreenBar.classList.remove('fullscreen');
            }
        }
    } else if (isResizing === true) {
        isResizing = false;
        windowInfo[actualTarget.id].size = [actualTarget.style.width.slice(0, -2), actualTarget.style.height.slice(0, -2)];
    }
});


function tryLaunchMove(element, x, y) {
    if (element.id == 'body') {getFocus(element.id); return toggleMenu(false);}

    if (!element.classList.contains('window')) return toggleMenu(false);

    getFocus(element.id);

    actualTarget = element;

    element.children[1].children[0].classList.add('moving');

    if (y.between(parseInt(element.style.top.slice(0, -2)), parseInt(element.style.top.slice(0, -2)) + 25)
        && x.between(parseInt(element.style.left.slice(0, -2)) + element.clientWidth - 25, parseInt(element.style.left.slice(0, -2)) + element.clientWidth - 5)) {
        element.remove();
        document.getElementById(element.id + 'Menu').remove();
        windowInfo[element.id].launched = false;
    } else if (y.between(parseInt(element.style.top.slice(0, -2)), parseInt(element.style.top.slice(0, -2)) + 25)
        && x.between(parseInt(element.style.left.slice(0, -2)) + element.clientWidth - 50, parseInt(element.style.left.slice(0, -2)) + element.clientWidth - 30)) {
        element.style.display = 'none';
        windowInfo[element.id].showed = false;
        const e = document.getElementById(element.id + 'Menu');
        e.classList.remove('selected');

    } else if (y.between(parseInt(element.style.top.slice(0, -2)), parseInt(element.style.top.slice(0, -2)) + 25)) {
        isMoving = true;

        mouseMarge.x = x - parseInt(element.style.left.slice(0, -2));
        mouseMarge.y = y - parseInt(element.style.top.slice(0, -2));
    } else if (y.between(parseInt(element.style.top.slice(0, -2)) + element.clientHeight, parseInt(element.style.top.slice(0, -2)) + element.clientHeight - 25)
        && x.between(parseInt(element.style.left.slice(0, -2)) + element.clientWidth - 30, parseInt(element.style.left.slice(0, -2)) + element.clientWidth - 5)) {
        isResizing = true;

        mouseMarge.x = element.clientWidth + parseInt(element.style.left.slice(0, -2)) - x;
        mouseMarge.y = element.clientHeight + parseInt(element.style.top.slice(0, -2)) - y;
    }

}


function getMaxZIndexFromClass(classToCheck) {
    const elements = document.getElementsByClassName(classToCheck);
    let highest = 0;
    for (let e of elements) {
        let zIndex = e.style.zIndex;
        if (zIndex == "") continue;
        if (parseInt(zIndex) > highest) highest = zIndex;
    }
    return parseInt(highest);
}


function getFocus(id) {
    const element = document.getElementById(id);

    if (windowInfo[id]) {
        if (windowInfo[id].showed == false) {
            element.style.display = 'flex';
            windowInfo[id].showed = true;
        }
    }
    
    const elementZIndex = element.style.zIndex == "" ? -1 : parseInt(element.style.zIndex);

    if (elementZIndex < getMaxZIndexFromClass('window')) element.style.zIndex = getMaxZIndexFromClass('window') + 1;

    const elements = document.getElementsByClassName('app');

    for (let e of elements) {
        if (e.id == id + "Menu") {
            if (e.classList.contains('selected')) continue;
            e.classList.add('selected');
        } else if (e.classList.contains('selected')) {
            e.classList.remove('selected');
        }
    }
}

function createNewWindow(index) {

    if (windowInfo[apps[index].id] && windowInfo[apps[index].id].launched == true) {
        return getFocus(apps[index].id);
    }

    const winName = apps[index].name;
    const newWindow = document.createElement('div');
    newWindow.classList.add('window');
    newWindow.id = apps[index].id;
    newWindow.style.top = 100 + Math.floor(Math.random() * 100) + 'px';
    newWindow.style.left = 100 + Math.floor(Math.random() * 100) + 'px';
    newWindow.style.zIndex = getMaxZIndexFromClass('window') + 1;

    const header = document.createElement('span');
    header.classList.add('bar');
    const winNameEle = document.createElement('p');
    winNameEle.innerHTML = winName;
    header.appendChild(winNameEle);
    const minimise = document.createElement('img');
    minimise.src = './assets/remove-24px.svg';
    header.appendChild(minimise);
    const close = document.createElement('img');
    close.src = './assets/close-24px.svg';
    header.appendChild(close);
    newWindow.appendChild(header);

    const content = document.createElement('span');
    const iframe = document.createElement('iframe');
    iframe.src = `./apps/${apps[index].dirname}/${apps[index].mainPage}`;
    content.appendChild(iframe);
    newWindow.appendChild(content);

    const footer = document.createElement('span');
    footer.classList.add('bar');
    if (apps[index].options != null) {
        for (let option of apps[index].options) {
            const a = document.createElement('a');
            a.classList.add('allowPointerEvents');
            a.innerHTML = option;
            footer.appendChild(a);
        }
    }
    const resize = document.createElement('img');
    resize.src = './assets/open_in_full-24px.svg';
    footer.appendChild(resize);
    newWindow.appendChild(footer);

    document.body.appendChild(newWindow);


    const taskbar = document.getElementById('taskbar');

    const menuEntry = document.createElement('span');
    menuEntry.classList.add('app');
    menuEntry.classList.add('selected');
    menuEntry.id = apps[index].id + 'Menu';
    menuEntry.onclick = () => { getFocus(apps[index].id) };
    const logo = document.createElement('img');
    logo.src = apps[index].icon;
    logo.classList.add('icon');
    menuEntry.appendChild(logo);
    const name = document.createElement('p');
    name.innerHTML = winName;
    menuEntry.appendChild(name);

    taskbar.insertBefore(menuEntry, hourEle);

    windowInfo[apps[index].id] = {
        fullScreen: false,
        allowFullScreen: false,
        showed: true,
        size: [newWindow.clientWidth, newWindow.clientHeight],
        launched: true
    }

    getFocus(apps[index].id);
}

function toggleMenu(state) {
    if (state == undefined) {
        if (mainmenu.classList.contains('hidden')) {
            mainmenu.classList.remove('hidden');
        } else {
            mainmenu.classList.add('hidden');
        }
    } else {
        if (state == false) {
            if (mainmenu.classList.contains('hidden')) return;
            mainmenu.classList.add('hidden');
        } else {
            if (!mainmenu.classList.contains('hidden')) return;
            mainmenu.classList.remove('hidden');
        }
    }
}


Number.prototype.toLenght = function (a) {
    let string = '';
    for(let i = 1; i <= a-1; i++) {
        string+='0';
    }
    return (string + this).slice(-a);
}


Number.prototype.between = function (a, b) {
    var min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    return this > min && this < max;
};