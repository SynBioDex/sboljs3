
import RdfParserXml = require('rdf-parser-rdfxml')
import RdfParserN3 = require('rdf-parser-n3')
import { Graph } from '.';

export default async function parseRDF(graph:Graph, rdf:string, mimeType:string):Promise<void> {

    let parser:any = null

    switch(mimeType) {

        case 'text/plain':
        case 'text/n3':
        case 'text/turtle':
        case 'text/n-triples':
            parser = new RdfParserN3()
            break

        case 'application/rdf+xml':
        case 'application/xml':
        case 'text/xml':
            parser = new RdfParserXml()
            break

        default:
            throw new Error('Unknown type ' + mimeType)
    }

    await parser.process(rdf, (triple) => {
        graph.graph.add(triple)
    })
}
