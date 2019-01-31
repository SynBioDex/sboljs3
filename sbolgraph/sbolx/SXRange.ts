
import SXIdentified from './SXIdentified'
import SXOrientedLocation from './SXOrientedLocation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";

export default class SXRange extends SXOrientedLocation {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOLX.Range
    }

    get start():number|undefined {
        return this.getIntProperty(Predicates.SBOLX.start)
    }

    set start(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOLX.start, n)
        } else {
            this.deleteProperty(Predicates.SBOLX.start)
        }
    }

    get end():number|undefined {
        return this.getIntProperty(Predicates.SBOLX.end)
    }

    set end(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOLX.end, n)
        } else {
            this.deleteProperty(Predicates.SBOLX.end)
        }
    }

    isFixed():boolean {
        return true
    }
}


