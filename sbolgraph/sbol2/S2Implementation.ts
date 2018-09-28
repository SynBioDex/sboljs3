
import S2Identified from "./S2Identified";
import SBOL2Graph from "../SBOL2Graph";
import { Types, Predicates } from "bioterms";
import { S2ComponentDefinition, S2ModuleDefinition } from "..";
import S2ProvActivity from "./S2ProvActivity";

export default class S2Implementation extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():S2ComponentDefinition|S2ModuleDefinition|undefined {

        let built = this.getUriProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }

        let builtObj = this.graph.uriToFacade(built)

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

    get activity():S2ProvActivity|undefined {

        let activity = this.getUriProperty(Predicates.Prov.wasGeneratedBy)

        if(!activity) {
            return undefined
        }

        return new S2ProvActivity(this.graph, activity)
    }

    set activity(activity:S2ProvActivity|undefined) {

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

        return new S2Identified(this.graph, design_uri)

        // console.log(this.graph.getTopLevelsWithPrefix(design_uri))

        // let design = this.graph.uriToFacade(design_uri)

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
