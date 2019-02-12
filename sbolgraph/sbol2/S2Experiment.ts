import S2Identified from './S2Identified'
import SBOL2Graph from '../SBOL2Graph';
import * as node from '../node'
import S2ExperimentalData from './S2ExperimentalData';
import S2ProvActivity from './S2ProvActivity';
import { Predicates, Types } from 'bioterms';
import { S2Implementation } from '..';


export default class S2Experiment extends S2Identified {

    constructor(graph:SBOL2Graph, uri:string) {

        super(graph, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Experiment
    }

    get experimentalData():Array<S2ExperimentalData> {

        let result:S2ExperimentalData[] = []
        let expDataURIs = this.getUriProperties(Predicates.SBOL2.experimentalData)

        for (let uri of expDataURIs){
            result.push(new S2ExperimentalData(this.graph, uri))
        }

        return result

        // return this.getUriProperties('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#experimentalData')
        //            .map((uri:string) => this.graph.uriToFacade(uri))
        //            .filter((r:SEP21ExperimentalData) => r !== undefined) as Array<SEP21ExperimentalData>

    }

    addExperimentalData(member:S2ExperimentalData):void {

        this.graph.add(this.uri, Predicates.SBOL2.experimentalData, node.createUriNode(member.uri))

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


    get construct():S2Implementation|undefined{

        let construct_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!construct_uri){
            return undefined
        }

        return new S2Implementation(this.graph, construct_uri)

    }

    // set construct(construct:S2Implementation|undefined) {

    //     if(construct === undefined) {
    //         this.deleteProperty(Predicates.Prov.wasDerivedFrom)
    //     } else {
    //         this.setUriProperty(Predicates.Prov.wasDerivedFrom, construct.uri)
    //     }
    // }


    addConstruct(construct:S2Implementation):void {

        this.graph.add(this.uri, Predicates.Prov.wasDerivedFrom, node.createUriNode(construct.uri))

    }

    get displayType():string {
        
        return "Experiment"
    }

}