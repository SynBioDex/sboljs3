
import SBOLXGraph from './SBOLXGraph'
import SBOL2Graph from './SBOL2Graph'

import fs = require('fs')

import fetch = require('node-fetch')

main()

async function main() {

    let filename = process.argv.slice(2).join(' ')

    let g = await SBOLXGraph.loadString(fs.readFileSync(filename) + '', 'application/rdf+xml')
    let outXFilename = filename + '_sbolx.xml'
    fs.writeFileSync(outXFilename, g.serializeXML())

    let g2 = await SBOL2Graph.loadString(g.serializeXML())
    console.log('ROUNDTRIPPED')
    g2.printTree()
    console.log('---')

    let outFilename = filename + '_rs.xml'
    fs.writeFileSync(outFilename, g2.serializeXML())

    let f = await fetch('http://www.async.ece.utah.edu/validate/', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            options: {
                language: 'SBOL2',
                test_equality: true,
                check_uri_compliance: false,
                check_completeness: false,
                check_best_practices: false,
                continue_after_first_error: false,
                provide_detailed_stack_trace: false,
                insert_type: false,
                main_file_name: 'main file',
                diff_file_name: 'comparison file'
            },
            return_file: false,
            main_file: fs.readFileSync(filename) + '',
            diff_file: g2.serializeXML()
        })
    })

    let r = await f.json()

    console.log(r)



}

