
import S2OrientedLocation from './S2OrientedLocation'

import { triple, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";

export default class S2GenericLocation extends S2OrientedLocation {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.GenericLocation
    }

}


