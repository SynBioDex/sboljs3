import { Node } from "rdfoo"

export default function extractTerm(subject:Node):string|undefined {

	let uri = subject.value

    let purl1 = 'http://purl.org/obo/owl/SO#'
    let purl2 = 'http://purl.obolibrary.org/obo/'
    let idorg = 'http://identifiers.org/so/'

    if(uri.indexOf(purl1) === 0) {
        return uri.slice(purl1.length).replace(/_/g, ':')
    } else if(uri.indexOf(purl2) === 0) {
        return uri.slice(purl2.length).replace(/_/g, ':')
    } else if(uri.indexOf(idorg) === 0) {
        return uri.slice(idorg.length)
    }

}
