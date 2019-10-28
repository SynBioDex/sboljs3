
import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import SBOL1GraphView from '../SBOL1GraphView'
import URIUtils from '../URIUtils'

export default class S1DnaSequence extends S1Facade {

    constructor(view:SBOL1GraphView, uri:string) {
        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL1.DnaSequence
    }

    get nucleotides():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.nucleotides)
    }

}
