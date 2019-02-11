
import SBOL2Graph from './SBOL2Graph'
import SBOLXGraph from './SBOLXGraph'

import fs = require('fs')

import glob = require('glob-promise')
import mkdirp = require('mkdirp-promise')
import path = require('path')

import fetch = require('node-fetch')
import chalk from 'chalk'

main().catch((e) => {
    console.dir(e)
})

async function main() {

    for(let f of await glob('SBOLTestSuite/**/*.*')) {

        // they're too big
        if(f.indexOf('genomes') !== -1)
            continue

        // they're wrong
        if(f.indexOf('InvalidFiles') !== -1)
            continue

        // not supported yet
        if(f.indexOf('SBOL1') !== -1)
            continue

        // more than a MB??
        if(fs.statSync(f).size > 1048576)
            continue

        console.log(chalk.cyanBright.bold('🔄 Converting file: ' + f))

        let outOrigFilename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_original.xml' ].join('')

        await mkdirp(path.dirname(outOrigFilename))

        fs.writeFileSync(outOrigFilename, fs.readFileSync(f) + '')


        console.log(chalk.cyanBright('🤔 SBOL2 -> SBOL2'))

        let g = await SBOL2Graph.loadString(fs.readFileSync(f) + '')
        let out2Filename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_sbol2.xml' ].join('')



        console.log(chalk.cyanBright('🤔 SBOL2 -> SBOLX'))

        let gx = await SBOLXGraph.loadString(fs.readFileSync(f) + '')
        let outXFilename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_sbolx.xml' ].join('')
        fs.writeFileSync(outXFilename, gx.serializeXML())


        console.log(chalk.cyanBright('🤔 SBOL2 -> SBOLX -> SBOL2'))

        let gRoundtrip = await SBOL2Graph.loadString(gx.serializeXML())
        let outRoundtripFilename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_roundtrip.xml' ].join('')
        fs.writeFileSync(outRoundtripFilename, gRoundtrip.serializeXML())
    }


    /*
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
*/


}

