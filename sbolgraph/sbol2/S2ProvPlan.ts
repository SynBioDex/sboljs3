
import S2Identified from "./S2Identified";
import SBOL2GraphView from "../SBOL2GraphView";
import { Types } from "bioterms";

export default class S2ProvPlan extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.Prov.Plan
    }
}
