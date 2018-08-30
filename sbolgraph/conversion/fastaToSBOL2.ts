
import SBOL2Graph from "../SBOL2Graph";
import { Predicates, Specifiers } from "bioterms";
import * as node from '../node'
import { S2Sequence } from "..";

export default function fastaToSBOL2(graph:SBOL2Graph, uriPrefix:string, fasta:string) {

    let lines = fasta.split('\n')

    let sequence:S2Sequence|null = null
    let elements:Array<string> = []

    for(let line of lines) {

        line = line.trim()

        if(line[0] === ';') {
            continue
        }

        if(line[0] === '>') {

            if(sequence) {
                setSequenceElementsAndGuessEncoding(sequence, elements.join(''))
                sequence = null
            }

            let { id, properties } = parseHeader(line)

            sequence = graph.createSequence(uriPrefix, id, '1')
            graph.insertProperties(sequence.uri, properties)

            continue
        }

        elements.push(line)
    }

    if(sequence) {
        setSequenceElementsAndGuessEncoding(sequence, elements.join(''))
    }
}

function parseHeader(header):any {

    if(header.startsWith('>sp|') || header.startsWith('>tr|')) {

        // looks like uniprot

        let matches = (/([^|]*?)\|([^|]*?)([^\s]+=)/g).exec(header)

        if(matches && matches.length === 4) {

            let accession = matches[1].trim()
            let entryName = matches[2].trim()
            let recommendedName = matches[3].trim()

            // TODO parse organism name etc.

            return {
                id: entryName,
                properties: {
                    [Predicates.Dcterms.title]: node.createStringNode(recommendedName),
                    ['http://edamontology.org/data_3021']: node.createStringNode(accession)
                }
            }
        }
    }

    // TODO pretty lame effort to match some of the NCBI ones
    // should probably expand this
    //
    if(header.startsWith('gb|')
        || header.startsWith('emb|')
        || header.startsWith('dbj|')
        || header.startsWith('sp|')
        || header.startsWith('ref|')
    ) {

        let tokens = header.split('|')
        let accession = tokens[1]

        return {
            id: accession,
            properties: {}
        }
    }

    return {
        // Couldn't do anything clever; just use the whole header as the name
        // and its first token as the ID
        id: header.slice(1).split(' ')[0] || 'imported_fasta',
        properties: {
            [Predicates.Dcterms.title]: node.createStringNode(header.slice(1)),
        }
    }
}

function setSequenceElementsAndGuessEncoding(sequence:S2Sequence, elements:string) {

    // I know that guessing the encoding isn't necessarily a good idea
    // because it's perfectly possible to have a chunk of protein composed entirely of
    // the nucleic acid alphabet.
    // However, we need to pick one for the encoding property of the sequence.
    // The options are basically:
    //    - Just set it to to DNA or protein and let the user change it later
    //    - Invent a new "I don't know" URI to use as the encoding property
    //             (should probably be in the SBOL spec, actually...)
    //    - Make a best guess
    // Considering it's not very likely at all that an amino acid sequence would look
    // like DNA (actually 0% likely for complete proteins) I've gone for the option of
    // guessing.
    // 
    let encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid

    let na = new Set([ 'A', 'a', 'T', 't', 'C', 'c', 'G', 'g', 'U', 'u', '*' ])

    for(let i = 0; i < elements.length; ++ i) {
        if(!na.has(elements[i])) {
            encoding = Specifiers.SBOL2.SequenceEncoding.AminoAcid
            break
        }
    }

    sequence.encoding = encoding
    sequence.elements = elements
}