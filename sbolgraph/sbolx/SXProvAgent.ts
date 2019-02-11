
import SXIdentified from "./SXIdentified";
import SBOLXGraph from "../SBOLXGraph";
import { Types, Predicates } from "bioterms";

export default class SXProvAgent extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Agent
    }

}
