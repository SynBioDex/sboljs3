
import S3Identified from './S3Identified'
import S3OrientedLocation from './S3OrientedLocation'

import { triple, Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";

export default class S3Cut extends S3OrientedLocation {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL3.Cut
    }

    get at():number|undefined {
        return this.getIntProperty(Predicates.SBOL3.at)
    }

    set at(n:number|undefined) {
        if(n !== undefined) {
            this.setIntProperty(Predicates.SBOL3.at, n)
        } else {
            this.deleteProperty(Predicates.SBOL3.at)
        }
    }

    isFixed():boolean {
        return true
    }
}


