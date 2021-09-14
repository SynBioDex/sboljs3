
import S2Identified from "./S2Identified";
import SBOL2GraphView from "../SBOL2GraphView";
import { Types, Predicates } from "bioterms";
import { S2ComponentDefinition, S2ModuleDefinition } from "..";
import { Activity, ProvView } from 'rdfoo-prov'
import { Node } from 'rdfoo'

export default class S2Implementation extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():S2ComponentDefinition|S2ModuleDefinition|undefined {

        let built = this.getProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }

        let builtObj = this.view.subjectToFacade(built)

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
            this.setProperty(Predicates.SBOL2.built, built.subject)
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
            this.setProperty(Predicates.Prov.wasGeneratedBy, activity.subject)
        }
    }

    get design():S2Identified|undefined{

        let design_subject = this.getProperty(Predicates.Prov.wasDerivedFrom)

        if(!design_subject){
            return undefined
        }

        return new S2Identified(this.view, design_subject)

        // console.log(this.view.getTopLevelsWithPrefix(design_subject))

        // let design = this.view.subjectToFacade(design_subject)

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
            this.setProperty(Predicates.Prov.wasDerivedFrom, design.subject)
        }
    }
    
    get displayType():string {
        
        return "Construct"
    }


}
