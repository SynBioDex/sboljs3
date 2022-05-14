
import S3Identified from './S3Identified'
import SBOL3GraphView from '../SBOL3GraphView';
import { node, Node } from 'rdfoo'
import S3ExperimentalData from './S3ExperimentalData';
import { Activity, ProvView }  from 'rdfoo-prov';
import { Predicates, Types } from 'bioterms';
import S3Implementation from './S3Implementation';


export default class S3Experiment extends S3Identified {

    constructor(view:SBOL3GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL3.Experiment
    }

    get experimentalData():Array<S3ExperimentalData> {

        let result:S3ExperimentalData[] = []
        let expDataURIs = this.getUriProperties(Predicates.SBOL3.experimentalData)

        for (let uri of expDataURIs){
            result.push(new S3ExperimentalData(this.view, node.createUriNode(uri)))
        }

        return result

        // return this.getUriProperties('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#experimentalData')
        //            .map((subject:Node) => this.view.subjectToFacade(subject))
        //            .filter((r:SEP21ExperimentalData) => r !== undefined) as Array<SEP21ExperimentalData>

    }

    addExperimentalData(member:S3ExperimentalData):void {

        this.insertProperty(Predicates.SBOL3.experimentalData, member.subject)

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


    get construct():S3Implementation|undefined{

        let construct_subject = this.getProperty(Predicates.Prov.wasDerivedFrom)

        if(!construct_subject){
            return undefined
        }

        return new S3Implementation(this.view, construct_subject)

    }

    // set construct(construct:S3Implementation|undefined) {

    //     if(construct === undefined) {
    //         this.deleteProperty(Predicates.Prov.wasDerivedFrom)
    //     } else {
    //         this.setUriProperty(Predicates.Prov.wasDerivedFrom, construct.subject)
    //     }
    // }


    addConstruct(construct:S3Implementation):void {

        this.insertProperty(Predicates.Prov.wasDerivedFrom, construct.subject)

    }

    get displayType():string {
        
        return "Experiment"
    }

}
