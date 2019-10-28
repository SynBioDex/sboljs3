
import SXIdentified from './SXIdentified'
import SXOrientedLocation from './SXOrientedLocation'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraphView from "../SBOLXGraphView";

export default class SXRange extends SXOrientedLocation {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

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


