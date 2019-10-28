

import S2Identified from "./S2Identified";
import SBOL2GraphView from "../SBOL2GraphView";
import S2ProvAgent from "./S2ProvAgent";
import S2ProvPlan from "./S2ProvPlan";
import { Types, Predicates } from "bioterms";

export default class S2ProvAssociation extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.Prov.Association
    }

    get agent():S2ProvAgent|undefined {

        let agent = this.getUriProperty(Predicates.Prov.agent)

        if(!agent) {
            return undefined
        }

        return new S2ProvAgent(this.view, agent)
    }

    set agent(agent:S2ProvAgent|undefined) {

        if(agent === undefined) {
            this.deleteProperty(Predicates.Prov.agent)
        } else {
            this.setUriProperty(Predicates.Prov.agent, agent.uri)
        }
    }

    get plan():S2ProvPlan|undefined {

        let plan = this.getUriProperty(Predicates.Prov.hadPlan)

        if(!plan) {
            return undefined
        }

        return new S2ProvPlan(this.view, plan)
    }

    set plan(plan:S2ProvPlan|undefined) {

        if(plan === undefined) {
            this.deleteProperty(Predicates.Prov.hadPlan)
        } else {
            this.setUriProperty(Predicates.Prov.hadPlan, plan.uri)
        }
    }

    get role():string|undefined {

        return this.getUriProperty(Predicates.Prov.hadRole)
    }

    set role(role:string|undefined) {
        this.setUriProperty(Predicates.Prov.hadRole, role)
    }


}
