
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import S2ProvAssociation from "./S2ProvAssociation";
import { Types, Predicates } from "bioterms";
import S2ProvPlan from "./S2ProvPlan";

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

    get plan():S2ProvPlan|undefined {

        let plan = this.getUriProperty(Predicates.Prov.hadPlan)

        if(!plan) {
            return undefined
        }

        return new S2ProvPlan(this.graph, plan)
    }

    set plan(plan:S2ProvPlan|undefined) {

        if(plan === undefined) {
            this.deleteProperty(Predicates.Prov.hadPlan)
        } else {
            this.setUriProperty(Predicates.Prov.hadPlan, plan.uri)
        }
    }

}
