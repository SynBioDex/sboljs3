
import S2OrientedLocation from './S2OrientedLocation'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";

export default class S2Cut extends S2OrientedLocation {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL2.GenericLocation
    }

    get at():number|undefined {
        return this.getIntProperty(Predicates.SBOL2.at)
    }

    set at(at:number|undefined) {
        if(at) {
            this.setIntProperty(Predicates.SBOL2.at, at)
        } else {
            this.deleteProperty(Predicates.SBOL2.at)
        }
    }

}


