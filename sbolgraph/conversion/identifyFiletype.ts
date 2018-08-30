
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

    if(content.substr(n, 5) === 'LOCUS') {
        return Filetype.GenBank
    }

    if(content.substr(n, 5) === '<?xml') {
        return Filetype.RDFXML
    }

    return null
}
