
import SXIdentified from "./SXIdentified";
import SBOLXGraphView from "../SBOLXGraphView";
import { Types, Predicates } from "bioterms";

export default class SXProvAgent extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.Prov.Agent
    }

}
