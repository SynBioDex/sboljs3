
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import S2ProvAssociation from "./S2ProvAssociation";
import { Types, Predicates } from "bioterms";
import S2ProvPlan from "./S2ProvPlan";
import S2ProvUsage from "./S2ProvUsage";
import { node } from 'rdfoo'

export default class S2ProvActivity extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.Prov.Activity
    }

    get type():string {

        const typeUri:string|undefined = this.getUriProperty(Predicates.SBOL2.type)

        if(!typeUri)
            throw new Error(this.uri + ' has no type?')

        return typeUri
    }

    get types():Array<string> {

        return this.getUriProperties(Predicates.SBOL2.type)
    }

    set type(uri:string) {

        this.setUriProperty(Predicates.SBOL2.type, uri)

    }

    addType(uri:string) {
        this.graph.insertProperties(this.uri, {
            [Predicates.SBOL2.type]: node.createUriNode(uri)
        })
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

    get usage():S2ProvUsage|undefined {

        let usage = this.getUriProperty(Predicates.Prov.qualifiedUsage)

        if(!usage) {
            return undefined
        }

        return new S2ProvUsage(this.graph, usage)
    }

    set usage(usage:S2ProvUsage|undefined) {

        if(usage === undefined) {
            this.deleteProperty(Predicates.Prov.qualifiedUsage)
        } else {
            this.setUriProperty(Predicates.Prov.qualifiedUsage, usage.uri)
        }
    }

    get association():S2ProvAssociation|undefined {

        let association = this.getUriProperty(Predicates.Prov.qualifiedAssociation)

        if(!association) {
            return undefined
        }

        return new S2ProvAssociation(this.graph, association)
    }

    set association(association:S2ProvAssociation|undefined) {

        if(association === undefined) {
            this.deleteProperty(Predicates.Prov.qualifiedAssociation)
        } else {
            this.setUriProperty(Predicates.Prov.qualifiedAssociation, association.uri)
        }
    }

}
