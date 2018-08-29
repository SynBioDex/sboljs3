
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import { Types } from "bioterms";

export default class S2ProvPlan extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Plan
    }
}
