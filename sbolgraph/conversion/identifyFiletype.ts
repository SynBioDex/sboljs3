
export enum Filetype {
    FASTA,
    GenBank,
    RDFXML,
    NTriples
}

export default function identifyFiletype(content:string, mimeType:string|null):Filetype|null {

    switch(mimeType) {
        case 'application/rdf+xml':
        case 'application/xml':
        case 'text/xml':
            return Filetype.RDFXML
        
        case 'text/turtle':
        case 'text/n3':
        case 'text/n-triples':
            return Filetype.NTriples
    }


    let n = 0;

    while(content[n].trim().length === 0)
        ++ n

    if(content[n] === '>') {
        return Filetype.FASTA
    }

    if(content[n] === '@') {
        return Filetype.NTriples // @prefix maybe
    }

    if(content[n] === '#') {
        return Filetype.NTriples // # Empty TURTLE
    }

    if(content.substr(n, 5) === 'LOCUS') {
        return Filetype.GenBank
    }

    if(content.substr(n, 5) === '<?xml') {
        return Filetype.RDFXML
    }

    if(content.substr(n, 5) === '<rdf:') {
        return Filetype.RDFXML
    }

    let firstLineEnd = content.indexOf('\n', n)

    if(firstLineEnd !== -1) {
        if(content[n] === '<' && content[firstLineEnd - 1] === '.') {
            return Filetype.NTriples
        }
    }

    return null
}
