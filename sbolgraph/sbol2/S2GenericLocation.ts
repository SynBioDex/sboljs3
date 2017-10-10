
import S2Identified from './S2Identified'
import S2OrientedLocation from './S2OrientedLocation'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOLGraph from "../SBOLGraph";

export default class S2GenericLocation extends S2OrientedLocation {

    constructor(graph:SBOLGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.GenericLocation
    }

}


