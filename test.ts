
import { SBOL2Graph, SBOLXGraph } from './sbolgraph'

import convertToSBOLX from './sbolgraph/convertToSBOLX'

import fs = require('mz/fs')

async function main() {

    const files = await fs.readdir('./tests')


    for(let file of files) {

        let src = await fs.readFile('./tests/' + file)

        let graph:SBOL2Graph = await SBOL2Graph.loadString(src.toString(), 'application/rdf+xml')

        const sxGraph:SBOLXGraph = convertToSBOLX(graph)

        const xml:string = await sxGraph.serializeXML()

        await fs.writeFile('./tests.out/' + file.split('.')[0] + '.sbolx.xml', xml)
    }





}

main()



