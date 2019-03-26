
import SXIdentified from './SXIdentified'
import SBOLXGraph from '../SBOLXGraph';
import * as node from '../node'
import SXExperimentalData from './SXExperimentalData';
import SXProvActivity from './SXProvActivity';
import { Predicates, Types } from 'bioterms';
import SXImplementation from './SXImplementation';


export default class SXExperiment extends SXIdentified {

    constructor(graph:SBOLXGraph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOLX.Experiment
    }

    get experimentalData():Array<SXExperimentalData> {

        let result:SXExperimentalData[] = []
        let expDataURIs = this.getUriProperties(Predicates.SBOLX.experimentalData)

        for (let uri of expDataURIs){
            result.push(new SXExperimentalData(this.graph, uri))
        }

        return result

        // return this.getUriProperties('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#experimentalData')
        //            .map((uri:string) => this.graph.uriToFacade(uri))
        //            .filter((r:SEP21ExperimentalData) => r !== undefined) as Array<SEP21ExperimentalData>

    }

    addExperimentalData(member:SXExperimentalData):void {

        this.graph.add(this.uri, Predicates.SBOLX.experimentalData, node.createUriNode(member.uri))

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


    get construct():SXImplementation|undefined{

        let construct_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!construct_uri){
            return undefined
        }

        return new SXImplementation(this.graph, construct_uri)

    }

    // set construct(construct:SXImplementation|undefined) {

    //     if(construct === undefined) {
    //         this.deleteProperty(Predicates.Prov.wasDerivedFrom)
    //     } else {
    //         this.setUriProperty(Predicates.Prov.wasDerivedFrom, construct.uri)
    //     }
    // }


    addConstruct(construct:SXImplementation):void {

        this.graph.add(this.uri, Predicates.Prov.wasDerivedFrom, node.createUriNode(construct.uri))

    }

    get displayType():string {
        
        return "Experiment"
    }

}
