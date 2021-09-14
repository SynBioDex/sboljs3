
import S3Identified from './S3Identified'

import { Node } from 'rdfoo'
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL3GraphView from "../SBOL3GraphView";
import S3Location from "./S3Location";

export default class S3OrientedLocation extends S3Location {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get orientation():string|undefined {

        return this.getUriProperty(Predicates.SBOL3.orientation)

    }

    set orientation(orientation:string|undefined) {

        this.setUriProperty(Predicates.SBOL3.orientation, orientation)

    }

    isFixed():boolean {
        return false
    }
}


