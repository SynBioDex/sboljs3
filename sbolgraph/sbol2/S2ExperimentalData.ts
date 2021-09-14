import S2Identified from "./S2Identified";
import SBOL2GraphView from "../SBOL2GraphView";
import { Types } from "bioterms";
import { Node } from 'rdfoo'

export default class S2ExperimentalData extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.ExperimentalData
    }

}
