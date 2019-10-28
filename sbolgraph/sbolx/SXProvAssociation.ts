

import SXIdentified from "./SXIdentified";
import SBOLXGraphView from "../SBOLXGraphView";
import SXProvAgent from "./SXProvAgent";
import SXProvPlan from "./SXProvPlan";
import { Types, Predicates } from "bioterms";

export default class SXProvAssociation extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.Prov.Association
    }

    get agent():SXProvAgent|undefined {

        let agent = this.getUriProperty(Predicates.Prov.agent)

        if(!agent) {
            return undefined
        }

        return new SXProvAgent(this.view, agent)
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

        return new SXProvPlan(this.view, plan)
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
