
import SXIdentified from "./SXIdentified";
import SBOLXGraph from "../SBOLXGraph";
import SXProvAssociation from "./SXProvAssociation";
import { Types, Predicates } from "bioterms";
import SXProvPlan from "./SXProvPlan";
import SXProvUsage from "./SXProvUsage"

export default class SXProvActivity extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Activity
    }

    get associations():Array<SXProvAssociation> {

        return this.getUriProperties(Predicates.Prov.qualifiedAssociation)
                    .map((uri) => new SXProvAssociation(this.graph, uri))

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

    get usage():SXProvUsage|undefined {

        let usage = this.getUriProperty(Predicates.Prov.qualifiedUsage)

        if(!usage) {
            return undefined
        }

        return new SXProvUsage(this.graph, usage)
    }

    set usage(usage:SXProvUsage|undefined) {

        if(usage === undefined) {
            this.deleteProperty(Predicates.Prov.qualifiedUsage)
        } else {
            this.setUriProperty(Predicates.Prov.qualifiedUsage, usage.uri)
        }
    }

    get association():SXProvAssociation|undefined {

        let association = this.getUriProperty(Predicates.Prov.qualifiedAssociation)

        if(!association) {
            return undefined
        }

        return new SXProvAssociation(this.graph, association)
    }

    set association(association:SXProvAssociation|undefined) {

        if(association === undefined) {
            this.deleteProperty(Predicates.Prov.qualifiedAssociation)
        } else {
            this.setUriProperty(Predicates.Prov.qualifiedAssociation, association.uri)
        }
    }

}
