
import S2Identified from "./S2Identified";
import SBOL2GraphView from "../SBOL2GraphView";
import { Types, Predicates } from "bioterms";
import { S2ComponentDefinition, S2ModuleDefinition } from "..";
import { Activity, ProvView } from 'rdfoo-prov'

export default class S2Implementation extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():S2ComponentDefinition|S2ModuleDefinition|undefined {

        let built = this.getUriProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }

        let builtObj = this.view.uriToFacade(built)

        if(builtObj instanceof S2ComponentDefinition)
            return builtObj as S2ComponentDefinition

        if(builtObj instanceof S2ModuleDefinition)
            return builtObj as S2ModuleDefinition

        throw new Error('built has wrong type')
    }

    set built(built:S2ComponentDefinition|S2ModuleDefinition|undefined) {

        if(built === undefined) {
            this.deleteProperty(Predicates.SBOL2.built)
        } else {
            this.setUriProperty(Predicates.SBOL2.built, built.uri)
        }
    }

    get activity():Activity|undefined {

        let activity = this.getUriProperty(Predicates.Prov.wasGeneratedBy)

        if(!activity) {
            return undefined
        }

        return new Activity(new ProvView(this.graph), activity)
    }

    set activity(activity:Activity|undefined) {

        if(activity === undefined) {
            this.deleteProperty(Predicates.Prov.wasGeneratedBy)
        } else {
            this.setUriProperty(Predicates.Prov.wasGeneratedBy, activity.uri)
        }
    }

    get design():S2Identified|undefined{

        let design_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!design_uri){
            return undefined
        }

        return new S2Identified(this.view, design_uri)

        // console.log(this.view.getTopLevelsWithPrefix(design_uri))

        // let design = this.view.uriToFacade(design_uri)

        // console.log(design)

        // if(design instanceof S2ComponentDefinition)
        //     return design as S2ComponentDefinition

        // if (design instanceof S2ModuleDefinition)
        //     return design as S2ModuleDefinition

        // throw new Error('design has wrong type')
    }

    set design(design:S2Identified|undefined) {

        if(design === undefined) {
            this.deleteProperty(Predicates.Prov.wasDerivedFrom)
        } else {
            this.setUriProperty(Predicates.Prov.wasDerivedFrom, design.uri)
        }
    }
    
    get displayType():string {
        
        return "Construct"
    }


}
