import { getRLCategory } from './utils.js';
import { getTaxonomy } from './utils.js';
document.addEventListener('DOMContentLoaded', () => {
    var yesno_collection = Array.from(document.getElementsByClassName('yes-no'));
    yesno_collection.forEach(_yesno => {
        //console.log(_yesno.id, document.getElementById(_yesno.id).innerHTML)
        if (document.getElementById(_yesno.id).innerHTML == 'TRUE') {
            document.getElementById(_yesno.id).innerHTML = 'SIM'
            document.getElementById(_yesno.id).classList.add("badge-info")
        } else {
            document.getElementById(_yesno.id).innerHTML = 'NÃO'
            document.getElementById(_yesno.id).classList.add("badge-danger")
        }
    })

    var _el = document.getElementsByClassName('spice')
    var idcat = _el[0].id
    var rlcat = `#spice-rl${idcat}`
    getRLCategory(document.querySelector(rlcat));
    var spice_code = document.querySelector(`#spice-code${idcat}`).innerHTML;
    getTaxonomy(spice_code.trim())

})
