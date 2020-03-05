
import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import URIUtils from '../URIUtils'
import S1DnaComponent from './S1DnaComponent';
import SBOL1GraphView from '../SBOL1GraphView'

export default class S1SequenceAnnotation extends S1Facade {

    constructor(view:SBOL1GraphView, uri:string) {
        super(view, uri)
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
        let uri = this.getUriProperty(Predicates.SBOL1.subComponent)
        if(uri === undefined)
            return undefined
        return new S1DnaComponent(this.view, uri)
    }

    get precedes():S1SequenceAnnotation[] {
        return this.getUriProperties(Predicates.SBOL1.precedes)
                   .map((uri) => new S1SequenceAnnotation(this.view, uri))
    }

}
