
import SXIdentified from "./SXIdentified";
import SBOLXGraph from "../SBOLXGraph";
import { Types } from "bioterms";

export default class SXExperimentalData extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOLX.ExperimentalData
    }

}
