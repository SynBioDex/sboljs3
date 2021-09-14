
import { Node, triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import SBOL1GraphView from '../SBOL1GraphView'
import URIUtils from '../URIUtils'

export default class S1DnaSequence extends S1Facade {

    constructor(view:SBOL1GraphView, subject:Node) {
        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL1.DnaSequence
    }

    get nucleotides():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.nucleotides)
    }

    get name():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.name)
    }

}

