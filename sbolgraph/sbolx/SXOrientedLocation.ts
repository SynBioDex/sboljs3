
import SXIdentified from './SXIdentified'

import { triple } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOLXGraphView from "../SBOLXGraphView";
import SXLocation from "./SXLocation";

export default class SXOrientedLocation extends SXLocation {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get orientation():string|undefined {

        return this.getUriProperty(Predicates.SBOLX.orientation)

    }

    set orientation(orientation:string|undefined) {

        this.setUriProperty(Predicates.SBOLX.orientation, orientation)

    }

    isFixed():boolean {
        return false
    }
}


