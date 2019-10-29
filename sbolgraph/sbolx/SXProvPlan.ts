
import SXIdentified from "./SXIdentified";
import SBOLXGraphView from "../SBOLXGraphView";
import { Types } from "bioterms";

export default class SXProvPlan extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.Prov.Plan
    }
}
