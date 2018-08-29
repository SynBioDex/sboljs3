
import S2Identified from './S2Identified'
import S2OrientedLocation from './S2OrientedLocation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2Graph from "../SBOL2Graph";

export default class S2Cut extends S2OrientedLocation {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

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


