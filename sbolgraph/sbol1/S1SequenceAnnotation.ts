
import { Node, triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import URIUtils from '../URIUtils'
import S1DnaComponent from './S1DnaComponent';
import SBOL1GraphView from '../SBOL1GraphView'

export default class S1SequenceAnnotation extends S1Facade {

    constructor(view:SBOL1GraphView, subject:Node) {
        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL1.SequenceAnnotation
    }

    get bioStart():number|undefined {
        return this.getIntProperty(Predicates.SBOL1.bioStart)
    }

    get bioEnd():number|undefined {
        return this.getIntProperty(Predicates.SBOL1.bioEnd)
    }

    get strand():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.strand)
    }

    get subComponent():S1DnaComponent|undefined {
        let subject = this.getProperty(Predicates.SBOL1.subComponent)
        if(subject === undefined)
            return undefined
        return new S1DnaComponent(this.view, subject)
    }

    get precedes():S1SequenceAnnotation[] {
        return this.getProperties(Predicates.SBOL1.precedes)
                   .map((subject) => new S1SequenceAnnotation(this.view, subject))
    }

}
