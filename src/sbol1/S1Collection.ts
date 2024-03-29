
import { Node, triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import URIUtils from '../URIUtils'
import S1DnaComponent from './S1DnaComponent';
import SBOL1GraphView from '../SBOL1GraphView'

export default class S1Collection extends S1Facade {

    constructor(view:SBOL1GraphView, subject:Node) {
        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL1.Collection
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

    get components():S1DnaComponent[] {
        return this.getProperties(Predicates.SBOL1.component)
                   .map((subject) => new S1DnaComponent(this.view, subject))
    }

}
