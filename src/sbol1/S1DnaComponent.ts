
import { Node, triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import SBOL1GraphView from '../SBOL1GraphView'
import URIUtils from '../URIUtils'
import S1SequenceAnnotation from './S1SequenceAnnotation'
import S1DnaSequence from './S1DnaSequence'

export default class S1DnaComponent extends S1Facade {

    constructor(view:SBOL1GraphView, subject:Node) {
        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL1.DnaComponent
    }

    get annotations():S1SequenceAnnotation[] {
        return this.getProperties(Predicates.SBOL1.annotation)
                   .map((subject) => new S1SequenceAnnotation(this.view, subject))
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
        let subject = this.getProperty(Predicates.SBOL1.dnaSequence)
        if(subject) {
            return new S1DnaSequence(this.view, subject)
        }
    }

    get subComponents():S1DnaComponent[] {

	let visited = new Set()
        let scs:Node[] = []

        for (let anno of this.annotations) {

            let sc = anno.subComponent

            if(sc && !visited.has(sc.subject.value)) {
                scs.push(sc.subject)
		visited.add(sc.subject.value)
            }
        }

        return scs.map(subject => new S1DnaComponent(this.view, subject))
    }


}
