
import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import SBOL1Graph from '../SBOL1Graph'
import URIUtils from '../URIUtils'

export default class S1DnaSequence extends S1Facade {

    constructor(graph:SBOL1Graph, uri:string) {
        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL1.DnaSequence
    }

    get nucleotides():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.nucleotides)
    }

}
