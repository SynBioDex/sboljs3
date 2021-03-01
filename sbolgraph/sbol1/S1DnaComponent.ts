
import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import SBOL1GraphView from '../SBOL1GraphView'
import URIUtils from '../URIUtils'
import S1SequenceAnnotation from './S1SequenceAnnotation'
import S1DnaSequence from './S1DnaSequence'

export default class S1DnaComponent extends S1Facade {

    constructor(view:SBOL1GraphView, uri:string) {
        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL1.DnaComponent
    }

    get annotations():S1SequenceAnnotation[] {
        return this.getUriProperties(Predicates.SBOL1.annotation)
                   .map((uri) => new S1SequenceAnnotation(this.view, uri))
    }

    get displayId():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.displayId)
    }

    get name():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.name)
    }

    get description():string|undefined {
        return this.getStringProperty(Predicates.SBOL1.description)
    }

    get dnaSequence():S1DnaSequence|undefined {
        let uri = this.getUriProperty(Predicates.SBOL1.dnaSequence)
        if(uri) {
            return new S1DnaSequence(this.view, uri)
        }
    }

    get subComponents():S1DnaComponent[] {

        let scs:string[] = []

        for (let anno of this.annotations) {

            let sc = anno.subComponent

            if(sc && scs.indexOf(sc.uri) === -1) {
                scs.push(sc.uri)
            }
        }

        return scs.map(uri => new S1DnaComponent(this.view, uri))
    }


}
