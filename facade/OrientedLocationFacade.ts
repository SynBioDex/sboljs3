
import IdentifiedFacade from './IdentifiedFacade'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'terms'
import SbolGraph from "../SbolGraph";
import LocationFacade from "sbolgraph/facade/LocationFacade";

export default abstract class OrientedLocationFacade extends LocationFacade {

    constructor(graph:SbolGraph, uri:string) {

        super(graph, uri)

    }

    get orientation():string|undefined {

        console.error('ORIENTED LOC ' + this.uri)
        console.dir(this.graph.match(this.uri, null, null))

        return this.getUriProperty(Predicates.SBOL2.orientation)

    }
}


