import S2Identified from './S2Identified'
import SBOL2GraphView from '../SBOL2GraphView';
import { node } from 'rdfoo'
import S2ExperimentalData from './S2ExperimentalData';
import { Activity } from 'rdfoo-prov';
import { Predicates, Types } from 'bioterms';
import S2Implementation from './S2Implementation';


export default class S2Experiment extends S2Identified {

    constructor(view:SBOL2GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL2.Experiment
    }

    get experimentalData():Array<S2ExperimentalData> {

        let result:S2ExperimentalData[] = []
        let expDataURIs = this.getUriProperties(Predicates.SBOL2.experimentalData)

        for (let uri of expDataURIs){
            result.push(new S2ExperimentalData(this.view, uri))
        }

        return result

        // return this.getUriProperties('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#experimentalData')
        //            .map((uri:string) => this.view.uriToFacade(uri))
        //            .filter((r:SEP21ExperimentalData) => r !== undefined) as Array<SEP21ExperimentalData>

    }

    addExperimentalData(member:S2ExperimentalData):void {

        this.insertProperty(Predicates.SBOL2.experimentalData, node.createUriNode(member.uri))

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


    get construct():S2Implementation|undefined{

        let construct_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!construct_uri){
            return undefined
        }

        return new S2Implementation(this.view, construct_uri)

    }

    // set construct(construct:S2Implementation|undefined) {

    //     if(construct === undefined) {
    //         this.deleteProperty(Predicates.Prov.wasDerivedFrom)
    //     } else {
    //         this.setUriProperty(Predicates.Prov.wasDerivedFrom, construct.uri)
    //     }
    // }


    addConstruct(construct:S2Implementation):void {

        this.insertProperty(Predicates.Prov.wasDerivedFrom, node.createUriNode(construct.uri))

    }

    get displayType():string {
        
        return "Experiment"
    }

}
