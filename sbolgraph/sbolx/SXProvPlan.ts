
import SXIdentified from "./SXIdentified";
import SBOLXGraph from "../SBOLXGraph";
import { Types } from "bioterms";

export default class SXProvPlan extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Plan
    }
}
