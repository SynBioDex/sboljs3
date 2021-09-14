
import S3Identified from "./S3Identified";
import SBOL3GraphView from "../SBOL3GraphView";
import { Types } from "bioterms";
import { Node } from 'rdfoo'

export default class S3ExperimentalData extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL3.ExperimentalData
    }

}
