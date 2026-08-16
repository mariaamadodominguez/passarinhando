import { getRLCategory } from './utils.js';
import { getTaxonomy } from './utils.js';
import { getXenoCanto } from './utils.js';
import { getWikiSummary } from './utils.js';
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
    var spice_code = document.querySelector(`#spice-code${idcat}`).innerHTML.trim();;
    var scientific_name = document.querySelector(`#sciname${idcat}`).innerHTML.trim();;
    var common_name = document.querySelector(`#comname${idcat}`).innerHTML.trim();;
    getTaxonomy(spice_code, True)
    getXenoCanto(spice_code, scientific_name)
    getWikiData(common_name, scientific_name)

})
const getWikiData = async (common_name, scientific_name) => {
    const wiki_summary = await getWikiSummary(common_name, scientific_name);
    document.getElementById('wiki-summary-text').innerText = wiki_summary
}
