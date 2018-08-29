
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import S2ProvAssociation from "./S2ProvAssociation";
import { Types, Predicates } from "bioterms";

export default class S2ProvActivity extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Activity
    }

    get associations():Array<S2ProvAssociation> {

        return this.getUriProperties(Predicates.Prov.qualifiedAssociation)
                    .map((uri) => new S2ProvAssociation(this.graph, uri))

    }

}
