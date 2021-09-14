
import S3Identified from "./S3Identified";
import SBOL2GraphView from "../SBOL2GraphView";
import { Types, Predicates } from "bioterms";
import S3Component from './S3Component'
import { Activity, ProvView } from "rdfoo-prov";
import SBOL3GraphView from "../SBOL3GraphView";
import { Node } from 'rdfoo'

export default class S3Implementation extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():S3Component|undefined {

        let built = this.getProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }

        let builtObj = this.view.subjectToFacade(built)

        if(builtObj instanceof S3Component)
            return builtObj as S3Component

        throw new Error('built has wrong type')
    }

    set built(built:S3Component|undefined) {

        if(built === undefined) {
            this.deleteProperty(Predicates.SBOL2.built)
        } else {
            this.setProperty(Predicates.SBOL2.built, built.subject)
        }
    }

    get activity():Activity|undefined {

        let activity = this.getProperty(Predicates.Prov.wasGeneratedBy)

        if(!activity) {
            return undefined
        }

        return new Activity(new ProvView(this.graph), activity)
    }

    set activity(activity:Activity|undefined) {

        if(activity === undefined) {
            this.deleteProperty(Predicates.Prov.wasGeneratedBy)
        } else {
            this.setProperty(Predicates.Prov.wasGeneratedBy, activity.subject)
        }
    }

    get design():S3Identified|undefined{

        let design_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!design_subject){
            return undefined
        }

        return new S3Identified(this.view, design_subject)

        // console.log(this.view.getTopLevelsWithPrefix(design_subject))

        // let design = this.view.subjectToFacade(design_subject)

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
            this.setUriProperty(Predicates.Prov.wasDerivedFrom, design.subject)
        }
    }
    
    get displayType():string {
        
        return "Construct"
    }


}
