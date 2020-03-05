
import fs = require('fs')

import glob = require('glob-promise')
import mkdirp = require('mkdirp-promise')
import path = require('path')

import fetch = require('node-fetch')
import chalk from 'chalk'
import { createDiffieHellman } from 'crypto';
import SBOL2GraphView from './SBOL2GraphView'
import SBOLXGraphView from './SBOLXGraphView'



let success:string[] = []
let fail:string[] = []
let changed:string[] = []


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

        if(f.indexOf('manifest.sh') !== -1 || f.indexOf('pom.xml') !== -1 || f.indexOf('README.md') !== -1)
            continue

        // more than a MB??
        if(fs.statSync(f).size > 1048576)
            continue

        console.log(chalk.cyanBright.bold('🔄 Converting file: ' + f))

        let outOrigFilename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_original.xml' ].join('')

        await mkdirp(path.dirname(outOrigFilename))

        fs.writeFileSync(outOrigFilename, fs.readFileSync(f) + '')


        console.log(chalk.cyanBright('🤔 Original -> SBOL2'))

        let g = await SBOL2GraphView.loadString(fs.readFileSync(f) + '')
        let out2Filename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_sbol2.xml' ].join('')
        fs.writeFileSync(out2Filename, g.serializeXML())
        await validate(f, out2Filename, f + ' ->SBOL2')


        console.log(chalk.cyanBright('🤔 Original -> SBOL2 -> Compliant SBOL2'))

        let g2C = await SBOL2GraphView.loadString(fs.readFileSync(f) + '')
        g2C.enforceURICompliance('http://compliant/')
        let out2CFilename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_sbol2_compliant.xml' ].join('')
        fs.writeFileSync(out2CFilename, g2C.serializeXML())
        await validate(f, out2CFilename, f + ' ->SBOL2->compliant')


        console.log(chalk.cyanBright('🤔 Original -> SBOLX'))

        let gx = await SBOLXGraphView.loadString(fs.readFileSync(f) + '')
        let outXFilename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_sbolx.xml' ].join('')
        fs.writeFileSync(outXFilename, gx.serializeXML())


        console.log(chalk.cyanBright('🤔 Original -> SBOLX -> SBOL2'))

        let gRoundtrip = await SBOL2GraphView.loadString(gx.serializeXML())
        let outRoundtripFilename = [ 'out/', path.dirname(f), '/', path.basename(f, path.extname(f)), '_roundtrip.xml' ].join('')
        fs.writeFileSync(outRoundtripFilename, gRoundtrip.serializeXML())
        await validate(f, outRoundtripFilename, f + ' ->SBOLX->SBOL2')
    }


    console.log(chalk.cyanBright('📝 Summary'))

    for(let s of success) {
        console.log('Success: ' + chalk.greenBright(s))
    }
    for(let s of changed) {
        console.log('Changed: ' + chalk.yellowBright(s))
    }
    for(let s of fail) {
        console.log('Failed: ' + chalk.redBright(s))
    }


    console.log(chalk.cyanBright('📊 Statistics'))
    console.log('       ' + success.length + ' succeeded')
    console.log('       ' + fail.length + ' failed')
    console.log('       ' + changed.length + ' succeeded but were different')

}

async function validate(orig:string, d:string, m:string) {

    console.log(chalk.cyanBright('🤔 Validating...'))

    let f = await fetch('http://www.async.ece.utah.edu/validate/', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        timeout: 30000,
        body: JSON.stringify({
            options: {
                uri_prefix: 'http://foo/',
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
            main_file: fs.readFileSync(orig) + '',
            diff_file: fs.readFileSync(d) + ''
        })
    })

    let r = await f.json()

    if(r.valid) {
        console.log(chalk.greenBright('✅ Valid'))
    } else {
        console.log(chalk.redBright('❌ NOT valid'))
        fail.push(m)
    }

    if(r.equal) {
        console.log(chalk.greenBright('✅ Equal'))
    } else {
        console.log(chalk.redBright('❌ NOT equal'))
        changed.push(m)
    }

    for(let e of r.errors) {
        console.log('       ' + e)
    }

    if(r.valid && r.equal) {
        success.push(m)
    }

}

