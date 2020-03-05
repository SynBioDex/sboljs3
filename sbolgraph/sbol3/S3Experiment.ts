
import S3Identified from './S3Identified'
import SBOL3GraphView from '../SBOL3GraphView';
import { node } from 'rdfoo'
import S3ExperimentalData from './S3ExperimentalData';
import { Activity }  from 'rdfoo-prov';
import { Predicates, Types } from 'bioterms';
import S3Implementation from './S3Implementation';


export default class S3Experiment extends S3Identified {

    constructor(view:SBOL3GraphView, uri:string) {

        super(view, uri)
    }

    get facadeType():string {
        return Types.SBOL3.Experiment
    }

    get experimentalData():Array<S3ExperimentalData> {

        let result:S3ExperimentalData[] = []
        let expDataURIs = this.getUriProperties(Predicates.SBOL3.experimentalData)

        for (let uri of expDataURIs){
            result.push(new S3ExperimentalData(this.view, uri))
        }

        return result

        // return this.getUriProperties('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#experimentalData')
        //            .map((uri:string) => this.view.uriToFacade(uri))
        //            .filter((r:SEP21ExperimentalData) => r !== undefined) as Array<SEP21ExperimentalData>

    }

    addExperimentalData(member:S3ExperimentalData):void {

        this.insertProperty(Predicates.SBOL3.experimentalData, node.createUriNode(member.uri))

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


    get construct():S3Implementation|undefined{

        let construct_uri = this.getUriProperty(Predicates.Prov.wasDerivedFrom)

        if(!construct_uri){
            return undefined
        }

        return new S3Implementation(this.view, construct_uri)

    }

    // set construct(construct:S3Implementation|undefined) {

    //     if(construct === undefined) {
    //         this.deleteProperty(Predicates.Prov.wasDerivedFrom)
    //     } else {
    //         this.setUriProperty(Predicates.Prov.wasDerivedFrom, construct.uri)
    //     }
    // }


    addConstruct(construct:S3Implementation):void {

        this.insertProperty(Predicates.Prov.wasDerivedFrom, node.createUriNode(construct.uri))

    }

    get displayType():string {
        
        return "Experiment"
    }

}
