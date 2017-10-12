
import S2Identified from './S2Identified'
import S2OrientedLocation from './S2OrientedLocation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOL2Graph from "../SBOL2Graph";

export default class S2Range extends S2OrientedLocation {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

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


