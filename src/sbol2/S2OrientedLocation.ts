
import { Types, Predicates, Specifiers } from 'bioterms'
import SBOL2GraphView from "../SBOL2GraphView";
import S2Location from "./S2Location";
import { Node } from 'rdfoo'

export default abstract class S2OrientedLocation extends S2Location {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get orientation():string|undefined {
        return this.getUriProperty(Predicates.SBOL2.orientation)
    }

    set orientation(orientation:string|undefined) {
        if(orientation)
            this.setUriProperty(Predicates.SBOL2.orientation, orientation)
        else
            this.deleteProperty(Predicates.SBOL2.orientation)
    }
}


