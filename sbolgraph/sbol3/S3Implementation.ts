
import S3Identified from "./S3Identified";
import SBOL2GraphView from "../SBOL2GraphView";
import { Types, Predicates } from "bioterms";
import S3Component from './S3Component'
import { Activity } from "rdfoo-prov";
import SBOL3GraphView from "../SBOL3GraphView";

export default class S3Implementation extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():S3Component|undefined {

        let built = this.getUriProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }

        let builtObj = this.view.uriToFacade(built)

        if(builtObj instanceof S3Component)
            return builtObj as S3Component

        throw new Error('built has wrong type')
    }

    set built(built:S3Component|undefined) {

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

        return new Activity(this.view, activity)
    }

    set activity(activity:Activity|undefined) {

        if(activity === undefined) {
            this.deleteProperty(Predicates.Prov.wasGeneratedBy)
        } else {
            this.setUriProperty(Predicates.Prov.wasGeneratedBy, activity.uri)
        }
    }

    get design():S3Identified|undefined{

        let design_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!design_uri){
            return undefined
        }

        return new S3Identified(this.view, design_uri)

        // console.log(this.view.getTopLevelsWithPrefix(design_uri))

        // let design = this.view.uriToFacade(design_uri)

        // console.log(design)

        // if(design instanceof S3ComponentDefinition)
        //     return design as S3ComponentDefinition

        // if (design instanceof S3ModuleDefinition)
        //     return design as S3ModuleDefinition

        // throw new Error('design has wrong type')
    }

    set design(design:S3Identified|undefined) {

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
