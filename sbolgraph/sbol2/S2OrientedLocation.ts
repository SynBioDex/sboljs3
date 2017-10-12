
import S2Identified from './S2Identified'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'sbolterms'
import SBOL2Graph from "../SBOL2Graph";
import S2Location from "./S2Location";

export default abstract class S2OrientedLocation extends S2Location {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get orientation():string|undefined {

        console.error('ORIENTED LOC ' + this.uri)
        console.dir(this.graph.match(this.uri, null, null))

        return this.getUriProperty(Predicates.SBOL2.orientation)

    }
}


