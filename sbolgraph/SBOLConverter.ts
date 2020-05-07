
import { Graph, identifyFiletype, Filetype, parseRDF } from 'rdfoo';
import convert1to2 from "./conversion/fromSBOL1/toSBOL2";
import convert2to3 from "./conversion/fromSBOL2/toSBOL3";
import convert3to2 from "./conversion/fromSBOL3/toSBOL2";

export default class SBOLConverter {

    static async convert1to2(g:Graph):Promise<void> {
        await convert1to2(g)
    }

    static async convert2to3(g:Graph):Promise<void> {
        await convert2to3(g)
    }

    static async convert3to2(g:Graph):Promise<void> {
        await convert3to2(g)
    }

}
