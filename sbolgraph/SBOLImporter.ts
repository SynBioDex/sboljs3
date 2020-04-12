import { SBOL1GraphView, SBOL2GraphView, SBOL3GraphView } from "sbolgraph";
import { Graph, identifyFiletype, Filetype, parseRDF } from 'rdfoo';
import convertXto2 from "./conversion/fromSBOL3/toSBOL2";
import convert1to2 from "./conversion/fromSBOL1/toSBOL2";
import convert2to3 from "./conversion/fromSBOL2/toSBOL3";
import convert3to2 from "./conversion/fromSBOL3/toSBOL2";
import request = require("request");
import fs = require('fs')
import fastaToSBOL2 from "./conversion/fastaToSBOL2";
import genbankToSBOL2 from "./conversion/genbankToSBOL2";

export default class SBOLImporter {

    static async sbol1GraphFromURL(url:string, defaultURIPrefix?:string):Promise<Graph> {
        return await this.sbol1GraphFromString(await get(url), defaultURIPrefix)
    }

    static async sbol1GraphFromFilename(str:string, defaultURIPrefix?:string, mimeType?:string):Promise<Graph> {
        return await this.sbol1GraphFromString(await load(str), defaultURIPrefix)
    }

    static async sbol1GraphFromString(str:string,  defaultURIPrefix?:string):Promise<Graph> {

        let filetype = identifyFiletype(str, '')

        let graph = new Graph()

        switch(filetype) {
            case Filetype.RDFXML:
            case Filetype.NTriples:
                await parseRDF(graph, str, filetype)
                return graph

            default:
                throw new Error('unsupported filetype')
        }
    }

    static async sbol2GraphFromURL(url:string, defaultURIPrefix?:string):Promise<Graph> {
        return await this.sbol2GraphFromString(await get(url), defaultURIPrefix)
    }

    static async sbol2GraphFromFilename(filename:string, defaultURIPrefix?:string):Promise<Graph> {
        return await this.sbol2GraphFromString(await load(filename), defaultURIPrefix)
    }

    static async sbol2GraphFromString(str:string,  defaultURIPrefix?:string):Promise<Graph> {

        let filetype = identifyFiletype(str, '')

        let graph = new Graph()

        switch(filetype) {

            case Filetype.RDFXML:
            case Filetype.NTriples:

                await parseRDF(graph, str, filetype)

                convert3to2(graph)
                convert1to2(graph)

                return graph
            
            case Filetype.FASTA:

                if(defaultURIPrefix === undefined) {
                    throw new Error('defaultURIPrefix must be specified')
                }

                await fastaToSBOL2(new SBOL2GraphView(graph), defaultURIPrefix, str)

                return graph

            case Filetype.GenBank:

                if(defaultURIPrefix === undefined) {
                    throw new Error('defaultURIPrefix must be specified')
                }

                await genbankToSBOL2(new SBOL2GraphView(graph), defaultURIPrefix, str)

                return graph

            default:
                throw new Error('unsupported filetype')
        }
    }

    static async sbol3GraphFromURL(url:string, defaultURIPrefix?:string):Promise<Graph> {
        return await this.sbol3GraphFromString(await get(url), defaultURIPrefix)
    }

    static async sbol3GraphFromFilename(filename:string, defaultURIPrefix?:string):Promise<Graph> {
        return await this.sbol3GraphFromString(await load(filename), defaultURIPrefix)
    }

    static async sbol3GraphFromString(str:string,  defaultURIPrefix?:string):Promise<Graph> {

        let filetype = identifyFiletype(str, '')
        let graph = new Graph()

        switch(filetype) {

            case Filetype.RDFXML:
            case Filetype.NTriples:

                await parseRDF(graph, str, filetype)

                convert1to2(graph)
                convert2to3(graph)

                return graph
            
            case Filetype.FASTA:

                if(defaultURIPrefix === undefined) {
                    throw new Error('defaultURIPrefix must be specified')
                }

                await fastaToSBOL2(new SBOL2GraphView(graph), defaultURIPrefix, str)

                return graph

            case Filetype.GenBank:

                if(defaultURIPrefix === undefined) {
                    throw new Error('defaultURIPrefix must be specified')
                }

                await genbankToSBOL2(new SBOL2GraphView(graph), defaultURIPrefix, str)

                return graph

            default:
                throw new Error('???')
        }

        return graph
    }

}

async function get(url:string):Promise<string> {
    return await new Promise((resolve, reject) => {
        request({
            url
        }, (err, resp, body) => {
            if(err)
                reject(err)
            else
                resolve(body)
        })
    })
}

async function load(filename:string):Promise<string> {
    return await new Promise((resolve, reject) => {
        fs.readFile(filename, (err, file) => {
            if(err)
                reject(err)
            else
                resolve(file.toString())
        })
    })
}
