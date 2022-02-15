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
            container.innerHTML +=
                `<div class="filme"><div class="title">${val.title || val.name} (${val.original_language})</div>
                <div class="vote"> nota ${val.vote_average}</div>
                <div class="detalhes" style="display:none;"><div class="description"><p>${descricao}</p><br><p>Ano: ${release}</p></div>
                <div class="poster"><img src="https://image.tmdb.org/t/p/w500/${val.poster_path}"/></div></div>
            </div>`;
        }
    );

    console.log(json.results[0]);
    const titulos = document.querySelectorAll('div.title, div.vote');

    titulos.forEach(
        it => {
            it.addEventListener(
                'click',
                ev => {
                    console.log(ev.target.parentElement.innerHTML);
                    const sty = ev.target.parentElement.querySelector('div.detalhes')?.style;
                    console.log(ev.target.parentElement.querySelector('div.detalhes'));
                    if (!sty)
                        return;

                    sty.display = sty.display == 'none' ? 'block' : 'none';
                }
            );
        }
    );

    atualizarPaginacao(pagina, max);
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