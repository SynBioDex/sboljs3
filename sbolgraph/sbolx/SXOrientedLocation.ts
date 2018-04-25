
import SXIdentified from './SXIdentified'

import * as triple from '../triple'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraph from "../SBOLXGraph";
import SXLocation from "./SXLocation";

export default class SXOrientedLocation extends SXLocation {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get orientation():string|undefined {

        return this.getUriProperty(Predicates.SBOLX.orientation)

    }

    set orientation(orientation:string|undefined) {

        this.setUriProperty(Predicates.SBOLX.orientation, orientation)

    }
}


