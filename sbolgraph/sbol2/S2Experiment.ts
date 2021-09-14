import S2Identified from './S2Identified'
import SBOL2GraphView from '../SBOL2GraphView';
import { node, Node } from 'rdfoo'
import S2ExperimentalData from './S2ExperimentalData';
import { Activity, ProvView } from 'rdfoo-prov';
import { Predicates, Types } from 'bioterms';
import S2Implementation from './S2Implementation';


export default class S2Experiment extends S2Identified {

    constructor(view:SBOL2GraphView, subject:Node) {

        super(view, subject)
    }

    get facadeType():string {
        return Types.SBOL2.Experiment
    }

    get experimentalData():Array<S2ExperimentalData> {

        let result:S2ExperimentalData[] = []
        let expDataURIs = this.getProperties(Predicates.SBOL2.experimentalData)

        for (let uri of expDataURIs){
            result.push(new S2ExperimentalData(this.view, uri))
        }

        return result

        // return this.getUriProperties('https://github.com/SynBioDex/SEPs/blob/sep21/sep_021.md#experimentalData')
        //            .map((subject:Node) => this.view.subjectToFacade(subject))
        //            .filter((r:SEP21ExperimentalData) => r !== undefined) as Array<SEP21ExperimentalData>

    }

    addExperimentalData(member:S2ExperimentalData):void {

        this.insertProperty(Predicates.SBOL2.experimentalData, member.subject)

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


    get construct():S2Implementation|undefined{

        let construct_uri = this.getProperty(Predicates.Prov.wasDerivedFrom)

        if(!construct_uri){
            return undefined
        }

        return new S2Implementation(this.view, construct_uri)

    }

    // set construct(construct:S2Implementation|undefined) {

    //     if(construct === undefined) {
    //         this.deleteProperty(Predicates.Prov.wasDerivedFrom)
    //     } else {
    //         this.setUriProperty(Predicates.Prov.wasDerivedFrom, construct.subject)
    //     }
    // }


    addConstruct(construct:S2Implementation):void {

        this.insertProperty(Predicates.Prov.wasDerivedFrom, construct.subject)

    }

    get displayType():string {
        
        return "Experiment"
    }

}
