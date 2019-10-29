
import S2OrientedLocation from './S2OrientedLocation'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";

export default class S2Range extends S2OrientedLocation {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Range
    }

    get start():number|undefined {
        return this.getIntProperty(Predicates.SBOL2.start)
    }

    set start(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOL2.start, n)
        } else {
            this.deleteProperty(Predicates.SBOL2.start)
        }
    }

    get end():number|undefined {
        return this.getIntProperty(Predicates.SBOL2.end)
    }

    set end(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOL2.end, n)
        } else {
            this.deleteProperty(Predicates.SBOL2.end)
        }
    }
}


