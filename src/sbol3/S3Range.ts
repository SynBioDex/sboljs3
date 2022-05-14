
import S3Identified from './S3Identified'
import S3OrientedLocation from './S3OrientedLocation'

import { triple, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";

export default class S3Range extends S3OrientedLocation {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.Range
    }

    get start():number|undefined {
        return this.getIntProperty(Predicates.SBOL3.start)
    }

    set start(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOL3.start, n)
        } else {
            this.deleteProperty(Predicates.SBOL3.start)
        }
    }

    get end():number|undefined {
        return this.getIntProperty(Predicates.SBOL3.end)
    }

    set end(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOL3.end, n)
        } else {
            this.deleteProperty(Predicates.SBOL3.end)
        }
    }

    isFixed():boolean {
        return true
    }
}


