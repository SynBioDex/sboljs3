
import S3Identified from "./S3Identified";
import SBOL3GraphView from "../SBOL3GraphView";
import { Types } from "bioterms";

export default class S3ExperimentalData extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL3.ExperimentalData
    }

}
