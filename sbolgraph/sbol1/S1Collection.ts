
import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'

import S1Facade from './S1Facade'

import SBOL1Graph from '../SBOL1Graph'
import URIUtils from '../URIUtils'
import S1DnaComponent from './S1DnaComponent';

export default class S1Collection extends S1Facade {

    constructor(graph:SBOL1Graph, uri:string) {
        super(graph, uri)
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
        return this.getUriProperties(Predicates.SBOL1.component)
                   .map((uri) => new S1DnaComponent(this.graph, uri))
    }

}