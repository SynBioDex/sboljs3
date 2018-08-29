
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import { Types, Predicates } from "bioterms";

export default class S2ProvAgent extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Agent
    }

}
