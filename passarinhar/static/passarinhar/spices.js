document.addEventListener('DOMContentLoaded', () => {
    var btns_collection = Array.from(document.getElementsByClassName('btn'));
    btns_collection.forEach(_btn => {
        document.getElementById(_btn.id).addEventListener('click', () =>
            showDetails(_btn.id));
    })


    function showDetails(spice_id) {
        var selector = `#spice-view${spice_id}`
        var parentselector = `#spice-div${spice_id}`
        // console.log(selector, parentselector, document.querySelector(selector).style.display)

        if (document.querySelector(selector).style.display == 'block') {
            document.querySelector(selector).style.display = 'none';
            document.querySelector(parentselector).style.display = 'block';

        } else {
            var rlcat = `#spice-rl${spice_id}`
            document.querySelector(selector).style.display = 'block';
            document.querySelector(parentselector).style.display = 'none';
            // console.log(rlcat, document.querySelector(rlcat).innerHTML)
            getRLCategory(document.querySelector(rlcat));
            var yesno_collection = Array.from(document.getElementsByClassName('yes-no'));
            yesno_collection.forEach(_yesno => {
                console.log(_yesno.id)
                if (document.getElementById(_yesno.id).innerHTML == 'TRUE') {
                    document.getElementById(_yesno.id).innerHTML = 'SIM'
                    document.getElementById(_yesno.id).classList.add("badge-info")
                } else {
                    document.getElementById(_yesno.id).innerHTML = 'NÃO'
                    document.getElementById(_yesno.id).classList.add("badge-danger")
                }
            })
        }
    }
}
);

function getRLCategory(rlcat) {
    var rl = rlcat.innerHTML
    let RL_CATEGORY;
    console.log('selector', rlcat, 'inner', rl.trim())
    switch (rl.trim()) {
        case 'EX':
            RL_CATEGORY = 'Extincto';
            rlcat.style = "color:red"
        case 'EW':
            RL_CATEGORY = 'Extincto na Natureza'
            rlcat.classList.add('badge-danger');
        case 'CR':
            RL_CATEGORY = "Peligro Crítico";
            rlcat.classList.add('badge-danger');
            break;
        case 'EN':
            RL_CATEGORY = "Peligro";
            rlcat.classList.add("badge-warning")
            break;
        case 'VU':
            RL_CATEGORY = "Vulnerável";
            rlcat.classList.add("badge-warning")
            break;
        case 'NT':
            RL_CATEGORY = "Quase ameaçado";
            rlcat.classList.add("badge-warning")
            break;
        case 'LC':
            RL_CATEGORY = "Pouco preocupante";
            rlcat.classList.add("badge-info")
            break;
        case 'DD':
        default:
            RL_CATEGORY = "Sem dados";
            rlcat.classList.add("badge-dark")
            break;
    }
    rlcat.innerHTML = RL_CATEGORY
    return;
} 