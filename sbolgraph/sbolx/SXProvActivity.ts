
import SXIdentified from "./SXIdentified";
import SBOLXGraphView from "../SBOLXGraphView";
import SXProvAssociation from "./SXProvAssociation";
import { Types, Predicates } from "bioterms";
import SXProvPlan from "./SXProvPlan";
import SXProvUsage from "./SXProvUsage"
import { node } from 'rdfoo'

export default class SXProvActivity extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.Prov.Activity
    }

    get type():string {

        const typeUri:string|undefined = this.getUriProperty(Predicates.SBOLX.type)

        if(!typeUri)
            throw new Error(this.uri + ' has no type?')

        return typeUri
    }

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOLX.type)
    }

    set type(uri:string) {

        this.setUriProperty(Predicates.SBOLX.type, uri)

    }

    addType(uri:string) {
        this.insertProperties({
            [Predicates.SBOLX.type]: node.createUriNode(uri)
        })
    }

    get associations():Array<SXProvAssociation> {

        return this.getUriProperties(Predicates.Prov.qualifiedAssociation)
                    .map((uri) => new SXProvAssociation(this.view, uri))

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

    get usage():SXProvUsage|undefined {

        let usage = this.getUriProperty(Predicates.Prov.qualifiedUsage)

        if(!usage) {
            return undefined
        }

        return new SXProvUsage(this.view, usage)
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

        return new SXProvAssociation(this.view, association)
    }

    set association(association:SXProvAssociation|undefined) {

        if(association === undefined) {
            this.deleteProperty(Predicates.Prov.qualifiedAssociation)
        } else {
            this.setUriProperty(Predicates.Prov.qualifiedAssociation, association.uri)
        }
    }

}
