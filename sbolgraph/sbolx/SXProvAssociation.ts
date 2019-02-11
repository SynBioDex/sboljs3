

import SXIdentified from "./SXIdentified";
import SBOLXGraph from "../SBOLXGraph";
import SXProvAgent from "./SXProvAgent";
import SXProvPlan from "./SXProvPlan";
import { Types, Predicates } from "bioterms";

export default class SXProvAssociation extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Association
    }

    get agent():SXProvAgent|undefined {

        let agent = this.getUriProperty(Predicates.Prov.agent)

        if(!agent) {
            return undefined
        }

        return new SXProvAgent(this.graph, agent)
    }

    set agent(agent:SXProvAgent|undefined) {

        if(agent === undefined) {
            this.deleteProperty(Predicates.Prov.agent)
        } else {
            this.setUriProperty(Predicates.Prov.agent, agent.uri)
        }
    }

    get plan():SXProvPlan|undefined {

        let plan = this.getUriProperty(Predicates.Prov.hadPlan)

        if(!plan) {
            return undefined
        }

        return new SXProvPlan(this.graph, plan)
    }

    set plan(plan:SXProvPlan|undefined) {

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
