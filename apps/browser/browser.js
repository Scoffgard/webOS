console.log('browser.js loaded !');

const iframeElement = document.getElementById('viewer');
iframeElement.src = "";

const urlbar = document.getElementById('urlbar');

let tabsInfos = [{ id: 'newtab', title: 'Nouvel onglet', url: ""}];

let actualTab = 0;


switchTab(0);

let websites = {};
fetch('../../internal_websites/websites_list.json')
    .then(response => response.json())
    .then(data => {
        websites = data;
    });

function handle(e) {
    if (e.keyCode === 13) {
        e.target.blur();

        const link = e.target.value.toLowerCase();

        if (!link.startsWith('http')) return showError('IURL');

        let protocol = link.startsWith('https') ? 'https://' : 'http://';

        let websiteFinded = false;
        let websiteIndex = 0;
        console.log(link.slice(protocol.length));
        for (let site of websites) {
            if (site.id == link.slice(protocol.length)) {
                websiteFinded = true;
                websiteIndex = websites.indexOf(site);
            } else {
                for (let alias of site.alias) {
                    if (alias == link.slice(protocol.length)) {
                        websiteFinded = true;
                        websiteIndex = websites.indexOf(site);
                    }
                }
            }
        }

        if (!websiteFinded) return showError('404');

        iframeElement.src = `../../internal_websites/${websites[websiteIndex].dirname}/${websites[websiteIndex].mainPage}`;

        tabsInfos[actualTab].id = websites[websiteIndex].id;
        tabsInfos[actualTab].link = link;
        tabsInfos[actualTab].title = websites[websiteIndex].name;

        const tabEle = document.getElementById('tab' + actualTab);
        const title = tabEle.firstElementChild.firstElementChild;
        title.innerHTML = tabsInfos[actualTab].title;
    }
}


function switchTab(tab) {
    const tabEle = document.getElementById('tab' + tab);

    for (let tabElement of tabEle.parentNode.childNodes) {
        if (tabElement == tabEle) continue;
        if (tabElement.nodeName == "#text") continue;
        if (tabElement.classList.contains('selected')) {
            tabElement.classList.remove('selected');
        }
    }

    actualTab = tab;

    tabEle.classList.add('selected');

    if (tabsInfos[tab].id != 'newtab') {
        for (let site of websites) {
            if (site.id == tabsInfos[tab].id) {
                urlbar.value = tabsInfos[tab].link;
                iframeElement.src = `../../internal_websites/${site.dirname}/${site.mainPage}`;
            }
        }
    } else {
        urlbar.value = '' ;
        iframeElement.src = '';
    }

}

function newTab() {
    const tabs = document.getElementById('tab0').parentNode;
    const addButton = document.getElementById('newtab');

    tabsInfos.push({ id: 'newtab', title: 'Nouvel onglet', url: ""});

    let tabId = tabsInfos.length-1;

    const newTab = document.createElement('span');
    newTab.id = `tab${tabId}`;
    const toclick = document.createElement('div');
    toclick.id = 'toclick';
    toclick.onclick = () => {switchTab(tabId)};
    const p = document.createElement('p');
    p.innerHTML = tabsInfos[tabId].title;
    toclick.appendChild(p);
    newTab.appendChild(toclick);
    const icon = document.createElement('img');
    icon.src = './assets/close-24px.svg';
    icon.onclick = () => {closeTab(tabId)}
    newTab.appendChild(icon);

    tabs.insertBefore(newTab, addButton);

    switchTab(tabId);
}

function closeTab(tab) {
    const tabEle = document.getElementById('tab' + tab);
    tabEle.remove();
    if (actualTab == tab) {
        switchTab(0);
    }
}

function showError(code) {
    iframeElement.src = `./errors/${code}.html`;
    const tabEle = document.getElementById('tab' + actualTab);
    const title = tabEle.firstElementChild.firstElementChild;
    title.innerHTML = code;
}