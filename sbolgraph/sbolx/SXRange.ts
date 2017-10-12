
import SXIdentified from './SXIdentified'
import SXOrientedLocation from './SXOrientedLocation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOLXGraph from "../SBOLXGraph";

export default class SXRange extends SXOrientedLocation {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Range
    }

    get start():number|undefined {
        return this.getIntProperty(Predicates.SBOLX.rangeStart)
    }

    set start(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOLX.rangeStart, n)
        } else {
            this.deleteProperty(Predicates.SBOLX.rangeStart)
        }
    }

    get end():number|undefined {
        return this.getIntProperty(Predicates.SBOLX.rangeEnd)
    }

    set end(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOLX.rangeEnd, n)
        } else {
            this.deleteProperty(Predicates.SBOLX.rangeEnd)
        }
    }
}


