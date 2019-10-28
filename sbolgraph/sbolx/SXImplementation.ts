
import SXIdentified from "./SXIdentified";
import SBOL2GraphView from "../SBOL2GraphView";
import { Types, Predicates } from "bioterms";
import SXComponent from './SXComponent'
import SXProvActivity from "./SXProvActivity";
import SBOLXGraphView from "../SBOLXGraphView";

export default class SXImplementation extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)

    }

    get facadeType():string {
        return Types.SBOL2.Implementation
    }


    get built():SXComponent|undefined {

        let built = this.getUriProperty(Predicates.SBOL2.built)

        if(!built) {
            return undefined
        }

        let builtObj = this.view.uriToFacade(built)

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

        return new SXProvActivity(this.view, activity)
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

        return new SXIdentified(this.view, design_uri)

        // console.log(this.view.getTopLevelsWithPrefix(design_uri))

        // let design = this.view.uriToFacade(design_uri)

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
