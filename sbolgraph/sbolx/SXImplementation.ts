
import SXIdentified from "./SXIdentified";
import SBOL2Graph from "../SBOL2Graph";
import { Types, Predicates } from "bioterms";
import SXComponent from './SXComponent'
import SXProvActivity from "./SXProvActivity";
import SBOLXGraph from "../SBOLXGraph";

export default class SXImplementation extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():SXComponent|undefined {

        let built = this.getUriProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }

        let builtObj = this.graph.uriToFacade(built)

        if(builtObj instanceof SXComponent)
            return builtObj as SXComponent

        throw new Error('built has wrong type')
    }

    set built(built:SXComponent|undefined) {

        if(built === undefined) {
            this.deleteProperty(Predicates.SBOL2.built)
        } else {
            this.setUriProperty(Predicates.SBOL2.built, built.uri)
        }
    }

    get activity():SXProvActivity|undefined {

        let activity = this.getUriProperty(Predicates.Prov.wasGeneratedBy)

        if(!activity) {
            return undefined
        }

        return new SXProvActivity(this.graph, activity)
    }

    set activity(activity:SXProvActivity|undefined) {

        if(activity === undefined) {
            this.deleteProperty(Predicates.Prov.wasGeneratedBy)
        } else {
            this.setUriProperty(Predicates.Prov.wasGeneratedBy, activity.uri)
        }
    }

    get design():SXIdentified|undefined{

        let design_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!design_uri){
            return undefined
        }

        return new SXIdentified(this.graph, design_uri)

        // console.log(this.graph.getTopLevelsWithPrefix(design_uri))

        // let design = this.graph.uriToFacade(design_uri)

        // console.log(design)

        // if(design instanceof SXComponentDefinition)
        //     return design as SXComponentDefinition

        // if (design instanceof SXModuleDefinition)
        //     return design as SXModuleDefinition

        // throw new Error('design has wrong type')
    }

    set design(design:SXIdentified|undefined) {

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
