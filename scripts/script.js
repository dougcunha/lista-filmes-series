const ROOT_URL = 'https://api.themoviedb.org/3/';
const API_KEY = 'a9356362bf7790473f0bb773c542a585';
const DEBUG = false;

const obterLinguagem = () => document.getElementById('lang').value;
const obterOrdenacao = () => document.getElementById('ordenacao').value + '.desc';
const alertar = msg => { if (DEBUG) alertar(msg); }
const obterTipo = () => [...document.querySelectorAll('input[type="radio"]')].find(f => f.checked).value || 'movie';
const obterBusca = () => document.getElementById('busca').value;

document.onload = function () {
    alertar('Loading...');

    document.getElementById('busca')
        .addEventListener('keypress', evt => {
            alertar(evt.key);
            if (evt.key == 'Enter')
                obterDoServidor();
    });

    obterDoServidor();
}();

function obterUrl(pagina = 1) {
    const busca = obterBusca();
    const path = `${busca ? "search" : "discover"}/${obterTipo()}`;
    const root = `${ROOT_URL}${path}?api_key=${API_KEY}&page=${pagina}`;
    let url = `${root}&language=${obterLinguagem()}&include_adult=false&sort_by=${obterOrdenacao()}`;

    if (busca)
        url += `&query=${busca}`;

    console.log(url);

    return url;
}

function obterDoServidor(pagina = 1) {
    fetch(obterUrl(pagina))
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                alertar(response);
                console.log(response);
            }
        })
        .then(json => {
            console.log(json);
            if (json)
                atualizarLista(json);
            else
                alertar('Nada aqui.');
        })
        .catch(erro => {
            console.log(`Erro: ${erro}`);
            alertar('Ver o console.');
        });
}

function atualizarLista(json) {
    pagina = json.page ?? 1;
    max = json.total_pages ?? 1;
    const container = document.querySelector('.container');
    container.innerHTML = '';

    json.results.map(
        val => {
            let descricao = val.overview.length == 0 ? 'Não há descrição disponível' : val.overview;
            let release = new Date(val.release_date || val.first_air_date).getFullYear() || 'N/A';
            container.innerHTML +=`
            <div class="filme">
                <div class="title">${val.title || val.name} (${val.original_language})</div>
                <div class="vote"> nota ${val.vote_average}</div>
                <div class="detalhes" style="display:none;">
                    <div class="description">
                        <p>${descricao}</p><br><p>Ano: ${release}</p>
                    </div>
                    <div class="poster">
                        <img title="${val.title}" src="https://image.tmdb.org/t/p/w500/${val.poster_path}"/>
                    </div>
                </div>
            </div>`;
        }
    );

    const titulos = document.querySelectorAll('div.title, div.vote');

    titulos.forEach(
        it => {
            it.addEventListener(
                'click',
                ev => {
                    const detalhes = ev.target.parentElement.querySelector('div.detalhes');
                    const visivel = detalhes.style.display == 'block';
                    const vizinhos = procurarVizinhos(ev.target.parentElement);

                    vizinhos.forEach(v => {
                        const it = v.querySelector('div.detalhes');
                        it.style.display = visivel ? 'none' : 'block';
                    });
                }
            );
        }
    );

    const posters = document.querySelectorAll('div.poster > img');
    posters.forEach(p => p.addEventListener('click', evt => mostrarPoster(evt.target)));
    atualizarPaginacao(pagina, max);
}

/*
    Retorna o seletor do elemento.
    Não é o seletor único. Vai retornar todos os elementos vizinhos do mesmo tipo.
*/
var getSelector = function(el) {
    if (el.tagName.toLowerCase() == "html")
        return "HTML";
    var str = el.tagName;
    str += (el.id != "") ? "#" + el.id : "";
    if (el.className) {
        var classes = el.className.split(/\s/);
        for (var i = 0; i < classes.length; i++) {
            str += "." + classes[i]
        }
    }

    return getSelector(el.parentNode) + " > " + str;
}

/*
    Retorna todos os elementos vizinhos, do mesmo tipo, que estão na mesma linha.
*/
function procurarVizinhos(el) {
    const top = el.getBoundingClientRect().top;
    const pai = el.parentElement;
    const selector = getSelector(el);
    console.log(selector);

    const vizinhos = [...pai.querySelectorAll(selector)]
      .filter(e => e.getBoundingClientRect().top == top);

    return vizinhos;
}

function mostrarPoster(img) {
    const modal = document.getElementById("poster");
    const modalImg = document.getElementById("image-poster");
    var captionText = document.getElementById("caption");
    modal.style.display = "block";
    modalImg.src = img.src;
    captionText.innerText = img.title;
}

function fechar() {
    const modal = document.getElementById("poster");
    modal.style.display = 'none';
}

function atualizarPaginacao(atual, total) {
    const div = document.getElementsByClassName('pagination')[0];
    const paginas = [`<a class="material-icons md-light" href="#" onclick="recarregar(1, ${total})">first_page</a>`];
    const qtd = total < 6 ? total : 6;
    const inicial = atual < 4 ? 1 : atual == total ? total - 5 : atual - 3;
    const ativa = 'class="active"';

    for (i = inicial; i < inicial + qtd; i++)
        paginas.push(`<a ${i == atual ? ativa : null} href="#" onclick="recarregar(${i}, ${total})">${i}</a>`)

    paginas.push(`<a class="material-icons md-light" href="#" onclick="recarregar(${total}, ${total})">last_page</a>`);
    div.innerHTML = '';

    paginas.forEach(
        s => div.innerHTML += s
    );
}

function recarregar(pagina, total) {
    atualizarPaginacao(pagina, total);
    obterDoServidor(pagina);
}