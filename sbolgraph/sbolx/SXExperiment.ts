
import SXIdentified from './SXIdentified'
import SBOLXGraphView from '../SBOLXGraphView';
import { node } from 'rdfoo'
import SXExperimentalData from './SXExperimentalData';
import { Activity }  from 'rdfoo-prov';
import { Predicates, Types } from 'bioterms';
import SXImplementation from './SXImplementation';


export default class SXExperiment extends SXIdentified {

    constructor(view:SBOLXGraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOLX.Experiment
    }

    get experimentalData():Array<SXExperimentalData> {

        let result:SXExperimentalData[] = []
        let expDataURIs = this.getUriProperties(Predicates.SBOLX.experimentalData)

        for (let uri of expDataURIs){
            result.push(new SXExperimentalData(this.view, uri))
        }

        return result

        // return this.getUriProperties('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#experimentalData')
        //            .map((uri:string) => this.view.uriToFacade(uri))
        //            .filter((r:SEP21ExperimentalData) => r !== undefined) as Array<SEP21ExperimentalData>

    }

    addExperimentalData(member:SXExperimentalData):void {

        this.insertProperty(Predicates.SBOLX.experimentalData, node.createUriNode(member.uri))

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


    get construct():SXImplementation|undefined{

        let construct_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!construct_uri){
            return undefined
        }

        return new SXImplementation(this.view, construct_uri)

    }

    // set construct(construct:SXImplementation|undefined) {

    //     if(construct === undefined) {
    //         this.deleteProperty(Predicates.Prov.wasDerivedFrom)
    //     } else {
    //         this.setUriProperty(Predicates.Prov.wasDerivedFrom, construct.uri)
    //     }
    // }


    addConstruct(construct:SXImplementation):void {

        this.insertProperty(Predicates.Prov.wasDerivedFrom, node.createUriNode(construct.uri))

    }

    get displayType():string {
        
        return "Experiment"
    }

}
